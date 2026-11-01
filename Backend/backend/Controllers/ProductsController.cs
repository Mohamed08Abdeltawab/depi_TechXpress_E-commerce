using backend.Data;
using backend.DTOs.Products;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly TechXpressDbContext _db;
    public ProductsController(TechXpressDbContext db) => _db = db;

    // GET /api/products?search=laptop&categoryId=1&minPrice=5000&sortBy=price&spec=RAM:16 GB&page=1&pageSize=12
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> List(
        [FromQuery] ProductQuery query, [FromQuery] bool includeInactive = false)
    {
        if (query.MinPrice < 0 || query.MaxPrice < 0 || query.MinPrice > query.MaxPrice)
            return BadRequest(ApiResponse.Fail("Invalid price range."));

        var q = _db.Products.AsNoTracking().AsQueryable();

        // الأدمن بس هو اللي يشوف المنتجات غير المفعّلة.
        if (!(includeInactive && User.IsInRole(Roles.Admin))) q = q.Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(p => p.Name.Contains(s) || (p.Description != null && p.Description.Contains(s)) ||
                             p.Sku.Contains(s) || p.Brand.Name.Contains(s));
        }
        if (query.CategoryId is int cat) q = q.Where(p => p.CategoryId == cat);
        if (query.BrandId is int brand) q = q.Where(p => p.BrandId == brand);
        if (query.MinPrice is decimal minP) q = q.Where(p => (p.DiscountPrice ?? p.Price) >= minP);
        if (query.MaxPrice is decimal maxP) q = q.Where(p => (p.DiscountPrice ?? p.Price) <= maxP);
        if (query.InStock == true) q = q.Where(p => p.StockQuantity > 0);

        if (query.Spec is { Length: > 0 })
        {
            foreach (var raw in query.Spec)
            {
                var idx = raw.IndexOf(':');
                if (idx <= 0 || idx == raw.Length - 1)
                    return BadRequest(ApiResponse.Fail($"Invalid spec filter '{raw}'. Use Name:Value."));
                var specName = raw[..idx].Trim();
                var specValue = raw[(idx + 1)..].Trim();
                q = q.Where(p => p.ProductSpecifications.Any(s => s.Name == specName && s.Value == specValue));
            }
        }

        var sortBy = query.SortBy?.Trim().ToLowerInvariant();
        var desc = query.SortDir?.ToLowerInvariant() switch
        {
            "desc" => true,
            "asc" => false,
            _ => sortBy is "price" or "name" ? false : true // الافتراضي: السعر والاسم تصاعدي، والباقي تنازلي
        };

        IOrderedQueryable<Product> ordered;
        switch (sortBy)
        {
            case "price":
                ordered = desc ? q.OrderByDescending(p => p.DiscountPrice ?? p.Price)
                               : q.OrderBy(p => p.DiscountPrice ?? p.Price);
                break;
            case "name":
                ordered = desc ? q.OrderByDescending(p => p.Name) : q.OrderBy(p => p.Name);
                break;
            case "popularity":
                // الشعبية = إجمالي الكمية المباعة في الطلبات غير الملغاة.
                ordered = desc
                    ? q.OrderByDescending(p => p.OrderItems.Where(oi => oi.Order.Status != "Cancelled").Sum(oi => (int?)oi.Quantity) ?? 0)
                    : q.OrderBy(p => p.OrderItems.Where(oi => oi.Order.Status != "Cancelled").Sum(oi => (int?)oi.Quantity) ?? 0);
                break;
            default: // newest
                ordered = desc ? q.OrderByDescending(p => p.CreatedAt) : q.OrderBy(p => p.CreatedAt);
                break;
        }
        ordered = ordered.ThenBy(p => p.Id); // ترتيب ثابت للـ pagination

        var total = await q.CountAsync();
        var items = await ordered
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new ProductListItemDto(
                p.Id, p.Name, p.Slug, p.Sku,
                p.Price, p.DiscountPrice, p.DiscountPrice ?? p.Price,
                p.StockQuantity, p.StockQuantity > 0,
                p.BrandId, p.Brand.Name, p.CategoryId, p.Category.Name,
                p.ProductImages.OrderByDescending(i => i.IsPrimary).ThenBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl).FirstOrDefault(),
                p.OrderItems.Where(oi => oi.Order.Status != "Cancelled").Sum(oi => (int?)oi.Quantity) ?? 0))
            .ToListAsync();

        return Ok(new PagedResult<ProductListItemDto>
        { Items = items, Page = query.Page, PageSize = query.PageSize, TotalCount = total });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id)
    {
        var dto = await ProjectDetail(_db.Products.AsNoTracking().Where(p => p.Id == id)).FirstOrDefaultAsync();
        return VisibleOrNotFound(dto);
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug)
    {
        var dto = await ProjectDetail(_db.Products.AsNoTracking().Where(p => p.Slug == slug)).FirstOrDefaultAsync();
        return VisibleOrNotFound(dto);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create(ProductUpsertRequest req)
    {
        var error = await ValidateAsync(req, null);
        if (error is not null) return error;

        var slug = await ResolveSlugAsync(req.Slug, req.Name, null);
        if (slug is null) return Conflict(ApiResponse.Fail("A product with this slug already exists."));

        var product = new Product { CreatedAt = DateTime.UtcNow, Slug = slug };
        ApplyScalars(product, req);
        product.Sku = await ResolveSkuAsync(req.Sku, req.BrandId, req.Name, null);
        AddChildren(product, req);

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var dto = await ProjectDetail(_db.Products.AsNoTracking().Where(p => p.Id == product.Id)).FirstAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, dto);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProductUpsertRequest req)
    {
        var product = await _db.Products
            .Include(p => p.ProductImages).Include(p => p.ProductSpecifications)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound(ApiResponse.Fail("Product not found."));

        var error = await ValidateAsync(req, id);
        if (error is not null) return error;

        if (!string.IsNullOrWhiteSpace(req.Slug))
        {
            var slug = await ResolveSlugAsync(req.Slug, req.Name, id);
            if (slug is null) return Conflict(ApiResponse.Fail("A product with this slug already exists."));
            product.Slug = slug;
        }

        ApplyScalars(product, req);
        product.UpdatedAt = DateTime.UtcNow;

        await using var tx = await _db.Database.BeginTransactionAsync();
        // نحذف القديم الأول ونحفظ، علشان الـ unique index على (ProductId, Name) ما يعترضش.
        if (req.Images is not null) _db.ProductImages.RemoveRange(product.ProductImages);
        if (req.Specifications is not null) _db.ProductSpecifications.RemoveRange(product.ProductSpecifications);
        await _db.SaveChangesAsync();

        AddChildren(product, req);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        var dto = await ProjectDetail(_db.Products.AsNoTracking().Where(p => p.Id == id)).FirstAsync();
        return Ok(dto);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products
            .Include(p => p.ProductImages).Include(p => p.ProductSpecifications).Include(p => p.CartItems)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound(ApiResponse.Fail("Product not found."));

        if (await _db.OrderItems.AnyAsync(oi => oi.ProductId == id))
        {
            // المنتج اتباع قبل كده: نعطّله بدل ما نمسحه، علشان سجل الطلبات يفضل سليم.
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _db.CartItems.RemoveRange(product.CartItems);
            _db.ProductImages.RemoveRange(product.ProductImages);
            _db.ProductSpecifications.RemoveRange(product.ProductSpecifications);
            _db.Products.Remove(product);
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost("{id:int}/images")]
    public async Task<IActionResult> AddImage(int id, ProductImageRequest req)
    {
        if (!await _db.Products.AnyAsync(p => p.Id == id)) return NotFound(ApiResponse.Fail("Product not found."));
        if (!IsValidImageUrl(req.ImageUrl)) return BadRequest(ApiResponse.Fail("ImageUrl must be an http(s) URL or start with '/'."));

        var existing = await _db.ProductImages.Where(i => i.ProductId == id).ToListAsync();
        var makePrimary = req.IsPrimary || existing.Count == 0;
        if (makePrimary) foreach (var i in existing) i.IsPrimary = false;

        var image = new ProductImage
        {
            ProductId = id,
            ImageUrl = req.ImageUrl.Trim(),
            IsPrimary = makePrimary,
            SortOrder = existing.Count == 0 ? 0 : existing.Max(i => i.SortOrder) + 1
        };
        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync();
        return StatusCode(StatusCodes.Status201Created,
            new ProductImageDto(image.Id, image.ImageUrl, image.IsPrimary, image.SortOrder));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage(int id, int imageId)
    {
        var image = await _db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id);
        if (image is null) return NotFound(ApiResponse.Fail("Image not found."));
        var wasPrimary = image.IsPrimary;
        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync();

        if (wasPrimary)
        {
            var next = await _db.ProductImages.Where(i => i.ProductId == id).OrderBy(i => i.SortOrder).FirstOrDefaultAsync();
            if (next is not null) { next.IsPrimary = true; await _db.SaveChangesAsync(); }
        }
        return NoContent();
    }

    // ---------------- helpers ----------------

    private ActionResult<ProductDetailDto> VisibleOrNotFound(ProductDetailDto? dto)
    {
        if (dto is null || (!dto.IsActive && !User.IsInRole(Roles.Admin)))
            return NotFound(ApiResponse.Fail("Product not found."));
        return Ok(dto);
    }

    private static IQueryable<ProductDetailDto> ProjectDetail(IQueryable<Product> q) =>
        q.Select(p => new ProductDetailDto(
            p.Id, p.Name, p.Slug, p.Description, p.Sku,
            p.Price, p.DiscountPrice, p.DiscountPrice ?? p.Price,
            p.StockQuantity, p.StockQuantity > 0, p.IsActive,
            p.BrandId, p.Brand.Name, p.CategoryId, p.Category.Name,
            p.ProductImages.OrderBy(i => i.SortOrder)
                .Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.IsPrimary, i.SortOrder)).ToList(),
            p.ProductSpecifications.OrderBy(s => s.Name)
                .Select(s => new ProductSpecDto(s.Name, s.Value)).ToList(),
            p.CreatedAt, p.UpdatedAt));

    private static bool IsValidImageUrl(string url)
    {
        url = url.Trim();
        if (url.StartsWith('/')) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var u) &&
               (u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps);
    }

    private async Task<IActionResult?> ValidateAsync(ProductUpsertRequest r, int? existingId)
    {
        if (r.DiscountPrice is decimal d && (d <= 0 || d >= r.Price))
            return BadRequest(ApiResponse.Fail("DiscountPrice must be greater than 0 and less than Price."));
        if (!await _db.Brands.AnyAsync(b => b.Id == r.BrandId))
            return BadRequest(ApiResponse.Fail("Brand does not exist."));
        if (!await _db.Categories.AnyAsync(c => c.Id == r.CategoryId))
            return BadRequest(ApiResponse.Fail("Category does not exist."));

        if (!string.IsNullOrWhiteSpace(r.Sku))
        {
            var sku = r.Sku.Trim();
            var ignore = existingId ?? 0;
            if (await _db.Products.AnyAsync(p => p.Sku == sku && p.Id != ignore))
                return Conflict(ApiResponse.Fail("A product with this SKU already exists."));
        }

        if (r.Specifications is not null)
        {
            var names = r.Specifications.Select(s => s.Name.Trim().ToLowerInvariant()).ToList();
            if (names.Any(string.IsNullOrEmpty) || r.Specifications.Any(s => string.IsNullOrWhiteSpace(s.Value)))
                return BadRequest(ApiResponse.Fail("Specification name and value cannot be empty."));
            if (names.Distinct().Count() != names.Count)
                return BadRequest(ApiResponse.Fail("Duplicate specification names are not allowed."));
        }
        if (r.Images is not null && r.Images.Any(i => !IsValidImageUrl(i.ImageUrl)))
            return BadRequest(ApiResponse.Fail("Every ImageUrl must be an http(s) URL or start with '/'."));
        return null;
    }

    /// <summary>يرجع null لو الـ slug اتبعت صراحةً وهو مستخدم بالفعل (409). غير كده يرجع slug فريد.</summary>
    private async Task<string?> ResolveSlugAsync(string? requested, string name, int? ignoreId)
    {
        var ignore = ignoreId ?? 0;
        var explicitSlug = !string.IsNullOrWhiteSpace(requested);
        var baseSlug = SlugHelper.Slugify(explicitSlug ? requested! : name, 270);
        if (baseSlug.Length == 0) baseSlug = "product";

        if (explicitSlug)
            return await _db.Products.AnyAsync(p => p.Slug == baseSlug && p.Id != ignore) ? null : baseSlug;

        var slug = baseSlug;
        var n = 2;
        while (await _db.Products.AnyAsync(p => p.Slug == slug && p.Id != ignore)) slug = $"{baseSlug}-{n++}";
        return slug;
    }

    private async Task<string> ResolveSkuAsync(string? requested, int brandId, string name, int? ignoreId)
    {
        var ignore = ignoreId ?? 0;
        if (!string.IsNullOrWhiteSpace(requested))
            return requested.Trim().ToUpperInvariant();

        var brandName = await _db.Brands.Where(b => b.Id == brandId).Select(b => b.Name).FirstOrDefaultAsync() ?? "TXP";
        var brandCode = new string(brandName.Where(char.IsLetterOrDigit).Take(4).ToArray()).ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(brandCode)) brandCode = "TXP";

        var nameClean = new string(name.Where(char.IsLetterOrDigit).Take(4).ToArray()).ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(nameClean)) nameClean = "PROD";

        string candidate;
        do
        {
            var randomNum = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 999999);
            candidate = $"{brandCode}-{nameClean}-{randomNum}";
        } while (await _db.Products.AnyAsync(p => p.Sku == candidate && p.Id != ignore));

        return candidate;
    }

    private static void ApplyScalars(Product p, ProductUpsertRequest r)
    {
        p.Name = r.Name.Trim();
        p.Description = r.Description?.Trim();
        if (!string.IsNullOrWhiteSpace(r.Sku)) p.Sku = r.Sku.Trim().ToUpperInvariant();
        p.Price = r.Price;
        p.DiscountPrice = r.DiscountPrice;
        p.StockQuantity = r.StockQuantity;
        p.CategoryId = r.CategoryId;
        p.BrandId = r.BrandId;
        p.IsActive = r.IsActive;
    }

    private static void AddChildren(Product p, ProductUpsertRequest r)
    {
        if (r.Specifications is not null)
            foreach (var s in r.Specifications)
                p.ProductSpecifications.Add(new ProductSpecification { Name = s.Name.Trim(), Value = s.Value.Trim() });

        if (r.Images is not null)
        {
            var primaryIndex = r.Images.FindIndex(i => i.IsPrimary);
            if (primaryIndex < 0 && r.Images.Count > 0) primaryIndex = 0; // لازم صورة رئيسية واحدة بالظبط
            for (var i = 0; i < r.Images.Count; i++)
                p.ProductImages.Add(new ProductImage
                {
                    ImageUrl = r.Images[i].ImageUrl.Trim(),
                    IsPrimary = i == primaryIndex,
                    SortOrder = r.Images[i].SortOrder
                });
        }
    }
}

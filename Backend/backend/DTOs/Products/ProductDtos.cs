using System.ComponentModel.DataAnnotations;
using backend.Helpers;

namespace backend.DTOs.Products;

public class ProductQuery : PaginationParams
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    /// <summary>الحد الأدنى للسعر النهائي (بعد الخصم).</summary>
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    /// <summary>فلترة بالمواصفات: ?spec=RAM:16 GB&amp;spec=Storage:512 GB (الاسم:القيمة، يتكرر).</summary>
    public string[]? Spec { get; set; }
    /// <summary>price | newest | name | popularity</summary>
    public string? SortBy { get; set; }
    /// <summary>asc | desc</summary>
    public string? SortDir { get; set; }
}

public record ProductImageDto(int Id, string ImageUrl, bool IsPrimary, int SortOrder);
public record ProductSpecDto(string Name, string Value);

public record ProductListItemDto(
    int Id, string Name, string Slug, string Sku,
    decimal Price, decimal? DiscountPrice, decimal FinalPrice,
    int StockQuantity, bool InStock,
    int BrandId, string BrandName, int CategoryId, string CategoryName,
    string? PrimaryImageUrl, int SoldCount);

public record ProductDetailDto(
    int Id, string Name, string Slug, string? Description, string Sku,
    decimal Price, decimal? DiscountPrice, decimal FinalPrice,
    int StockQuantity, bool InStock, bool IsActive,
    int BrandId, string BrandName, int CategoryId, string CategoryName,
    List<ProductImageDto> Images, List<ProductSpecDto> Specifications,
    DateTime CreatedAt, DateTime? UpdatedAt);

public class ProductImageRequest
{
    [Required, MaxLength(1000)] public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class ProductSpecRequest
{
    [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
    [Required, MaxLength(500)] public string Value { get; set; } = string.Empty;
}

public class ProductUpsertRequest
{
    [Required, MaxLength(250)] public string Name { get; set; } = string.Empty;
    /// <summary>اختياري: لو فاضي يتولّد من الاسم.</summary>
    [MaxLength(280)] public string? Slug { get; set; }
    public string? Description { get; set; }
    /// <summary>اختياري: لو فاضي يتولّد تلقائياً.</summary>
    [MaxLength(100)] public string? Sku { get; set; }
    [Range(0.01, 10_000_000)] public decimal Price { get; set; }
    /// <summary>السعر بعد الخصم (مش نسبة). لازم يكون أقل من Price.</summary>
    public decimal? DiscountPrice { get; set; }
    [Range(0, 1_000_000)] public int StockQuantity { get; set; }
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [Range(1, int.MaxValue)] public int BrandId { get; set; }
    public bool IsActive { get; set; } = true;
    /// <summary>لو null في التعديل = سيب الصور زي ما هي. لو مبعوتة = استبدل كلها.</summary>
    public List<ProductImageRequest>? Images { get; set; }
    /// <summary>لو null في التعديل = سيب المواصفات زي ما هي. لو مبعوتة = استبدل كلها.</summary>
    public List<ProductSpecRequest>? Specifications { get; set; }
}

public record CategoryDto(int Id, string Name, string Slug, int? ParentCategoryId, bool IsActive, int ProductCount);
public class CategoryUpsertRequest
{
    [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(180)] public string? Slug { get; set; }
    public int? ParentCategoryId { get; set; }
    public bool IsActive { get; set; } = true;
}

public record BrandDto(int Id, string Name, string? LogoUrl, bool IsActive, int ProductCount);
public class BrandUpsertRequest
{
    [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(1000)] public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

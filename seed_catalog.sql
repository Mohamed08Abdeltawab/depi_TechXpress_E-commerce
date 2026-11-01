-- TechXpress Database Rich Catalog Seeding Script
SET NOCOUNT ON;

-- 1. Brands
IF NOT EXISTS (SELECT 1 FROM Brands WHERE Id = 1)
    INSERT INTO Brands (Name, IsActive) VALUES ('Dell', 1);
ELSE
    UPDATE Brands SET Name = 'Dell', IsActive = 1 WHERE Id = 1;

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Id = 2)
    INSERT INTO Brands (Name, IsActive) VALUES ('Apple', 1);
ELSE
    UPDATE Brands SET Name = 'Apple', IsActive = 1 WHERE Id = 2;

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Id = 3)
    INSERT INTO Brands (Name, IsActive) VALUES ('Samsung', 1);
ELSE
    UPDATE Brands SET Name = 'Samsung', IsActive = 1 WHERE Id = 3;

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Id = 4)
    INSERT INTO Brands (Name, IsActive) VALUES ('Sony', 1);
ELSE
    UPDATE Brands SET Name = 'Sony', IsActive = 1 WHERE Id = 4;

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Name = 'LG')
    INSERT INTO Brands (Name, IsActive) VALUES ('LG', 1);

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Name = 'ASUS')
    INSERT INTO Brands (Name, IsActive) VALUES ('ASUS', 1);

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Name = 'Keychron')
    INSERT INTO Brands (Name, IsActive) VALUES ('Keychron', 1);

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Name = 'Logitech')
    INSERT INTO Brands (Name, IsActive) VALUES ('Logitech', 1);

IF NOT EXISTS (SELECT 1 FROM Brands WHERE Name = 'Anker')
    INSERT INTO Brands (Name, IsActive) VALUES ('Anker', 1);

-- 2. Categories
IF NOT EXISTS (SELECT 1 FROM Categories WHERE Id = 1)
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Laptops & Computers', 'laptops-and-computers', NULL, 1);
ELSE
    UPDATE Categories SET Name = 'Laptops & Computers', Slug = 'laptops-and-computers', IsActive = 1 WHERE Id = 1;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Id = 2)
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Smartphones & Tablets', 'smartphones-and-tablets', NULL, 1);
ELSE
    UPDATE Categories SET Name = 'Smartphones & Tablets', Slug = 'smartphones-and-tablets', IsActive = 1 WHERE Id = 2;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Id = 3)
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Audio & Headphones', 'audio-and-headphones', NULL, 1);
ELSE
    UPDATE Categories SET Name = 'Audio & Headphones', Slug = 'audio-and-headphones', IsActive = 1 WHERE Id = 3;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Id = 4)
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Monitors & Displays', 'monitors-and-displays', NULL, 1);
ELSE
    UPDATE Categories SET Name = 'Monitors & Displays', Slug = 'monitors-and-displays', IsActive = 1 WHERE Id = 4;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'gaming-and-consoles')
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Gaming & Consoles', 'gaming-and-consoles', NULL, 1);

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = 'accessories')
    INSERT INTO Categories (Name, Slug, ParentCategoryId, IsActive) VALUES ('Accessories & Peripherals', 'accessories', NULL, 1);

-- Resolve Brand IDs
DECLARE @BrandDell INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Dell');
DECLARE @BrandApple INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Apple');
DECLARE @BrandSamsung INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Samsung');
DECLARE @BrandSony INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Sony');
DECLARE @BrandLG INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'LG');
DECLARE @BrandASUS INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'ASUS');
DECLARE @BrandKeychron INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Keychron');
DECLARE @BrandLogitech INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Logitech');
DECLARE @BrandAnker INT = (SELECT TOP 1 Id FROM Brands WHERE Name = 'Anker');

-- Resolve Category IDs
DECLARE @CatLaptops INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'laptops-and-computers');
DECLARE @CatSmartphones INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'smartphones-and-tablets');
DECLARE @CatAudio INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'audio-and-headphones');
DECLARE @CatMonitors INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'monitors-and-displays');
DECLARE @CatGaming INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'gaming-and-consoles');
DECLARE @CatAccessories INT = (SELECT TOP 1 Id FROM Categories WHERE Slug = 'accessories');

-- Clean old images and specs for existing products 1..4 so we can refresh them
DELETE FROM ProductImages WHERE ProductId IN (1, 2, 3, 4);
DELETE FROM ProductSpecifications WHERE ProductId IN (1, 2, 3, 4);

-- Product 1: Dell XPS 15 9530 OLED
UPDATE Products SET
    Name = 'Dell XPS 15 9530 OLED (Core i9, 32GB RAM, 1TB SSD, RTX 4070)',
    Slug = 'dell-xps-15-oled-i9-rtx4070',
    SKU = 'DELL-XPS15-9530',
    Description = 'The pinnacle of executive power and creative mastery. Featuring a breath-taking 3.5K OLED InfinityEdge touch display, Intel Core i9-13900H 14-core processor, NVIDIA GeForce RTX 4070 studio-ready graphics, and CNC aluminum chassis with carbon fiber palm rest.',
    Price = 92000.00,
    DiscountPrice = 84999.00,
    StockQuantity = 8,
    CategoryId = @CatLaptops,
    BrandId = @BrandDell,
    IsActive = 1,
    UpdatedAt = GETUTCDATE()
WHERE Id = 1;

INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
(1, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&auto=format&fit=crop&q=80', 1, 0),
(1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&auto=format&fit=crop&q=80', 0, 1),
(1, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1000&auto=format&fit=crop&q=80', 0, 2);

INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
(1, 'Processor', 'Intel Core i9-13900H (14 cores, 20 threads, up to 5.4 GHz)'),
(1, 'Memory (RAM)', '32 GB DDR5 4800MHz Dual-Channel'),
(1, 'Storage', '1 TB M.2 PCIe Gen4 NVMe SSD'),
(1, 'Graphics (GPU)', 'NVIDIA GeForce RTX 4070 8GB GDDR6'),
(1, 'Display', '15.6" 3.5K (3456 x 2160) OLED Touch, 400 nits, 100% DCI-P3'),
(1, 'Battery & Power', '86 Whr 6-Cell Battery with 130W USB-C GaN Charger'),
(1, 'Operating System', 'Windows 11 Pro 64-bit Licensed'),
(1, 'Warranty', '2 Years Official Dell ProSupport Warranty');

-- Product 2: Apple MacBook Pro 16" M3 Max
UPDATE Products SET
    Name = 'Apple MacBook Pro 16" M3 Max (36GB Unified Memory, 1TB SSD, Space Black)',
    Slug = 'apple-macbook-pro-16-m3-max',
    SKU = 'APL-MBP16-M3MAX',
    Description = 'Mind-blowing capability for extreme workflows. Powered by M3 Max with a 14-core CPU and 30-core GPU, Liquid Retina XDR display with 1600 nits peak brightness, hardware-accelerated ray tracing, and up to 22 hours of battery life.',
    Price = 138000.00,
    DiscountPrice = 129500.00,
    StockQuantity = 5,
    CategoryId = @CatLaptops,
    BrandId = @BrandApple,
    IsActive = 1,
    UpdatedAt = GETUTCDATE()
WHERE Id = 2;

INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
(2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80', 1, 0),
(2, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&auto=format&fit=crop&q=80', 0, 1),
(2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&auto=format&fit=crop&q=80', 0, 2);

INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
(2, 'Processor', 'Apple M3 Max (14-Core CPU: 10 performance, 4 efficiency)'),
(2, 'Memory (RAM)', '36 GB Unified High-Bandwidth Memory (300GB/s)'),
(2, 'Storage', '1 TB Ultra-Fast PCIe SSD (7.4 GB/s read)'),
(2, 'Graphics (GPU)', '30-Core Integrated GPU with Hardware Ray Tracing'),
(2, 'Display', '16.2" Liquid Retina XDR (3456 x 2234), 120Hz ProMotion'),
(2, 'Battery & Power', '100 Whr Li-Poly, up to 22h, 140W USB-C MagSafe 3'),
(2, 'Operating System', 'macOS Sonoma (Complimentary upgrade ready)'),
(2, 'Warranty', '1 Year Official Apple Authorised Warranty');

-- Product 3: Samsung Galaxy S24 Ultra 5G
UPDATE Products SET
    Name = 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 512GB, Titanium Gray)',
    Slug = 'samsung-galaxy-s24-ultra-512gb',
    SKU = 'SAM-S24U-512-GRY',
    Description = 'Welcome to the era of Galaxy AI. Encased in a refined titanium shield with flat 6.8" Dynamic AMOLED 2X 2600-nit display, Snapdragon 8 Gen 3 for Galaxy, embedded S-Pen, and 200MP Quad Telephoto optical camera.',
    Price = 64000.00,
    DiscountPrice = 57900.00,
    StockQuantity = 12,
    CategoryId = @CatSmartphones,
    BrandId = @BrandSamsung,
    IsActive = 1,
    UpdatedAt = GETUTCDATE()
WHERE Id = 3;

INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
(3, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1000&auto=format&fit=crop&q=80', 1, 0),
(3, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&auto=format&fit=crop&q=80', 0, 1),
(3, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&auto=format&fit=crop&q=80', 0, 2);

INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
(3, 'Processor', 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)'),
(3, 'Memory (RAM)', '12 GB LPDDR5X'),
(3, 'Storage', '512 GB UFS 4.0'),
(3, 'Camera System', '200MP Main + 50MP Periscope (5x) + 10MP Tele (3x) + 12MP Ultra-wide'),
(3, 'Display', '6.8" Dynamic AMOLED 2X, QHD+, 1-120Hz, 2600 nits, Gorilla Armor'),
(3, 'Battery & Charging', '5000 mAh with 45W Fast Wired and 15W Wireless Charging'),
(3, 'Body & Build', 'Grade 2 Titanium Frame, IP68 Dust/Water Resistant, Embedded S-Pen'),
(3, 'Warranty', '1 Year Official Samsung Egypt Warranty with Screen Care');

-- Product 4: Apple iPhone 16 Pro Max
UPDATE Products SET
    Name = 'Apple iPhone 16 Pro Max 256GB (Desert Titanium, 5G)',
    Slug = 'apple-iphone-16-pro-max-256gb',
    SKU = 'APL-IP16PM-256-DS',
    Description = 'Forged in titanium with innovative Camera Control, 4K 120 fps Dolby Vision, and groundbreaking A18 Pro chip. Features the thinnest borders on any Apple product and up to 33 hours of video playback.',
    Price = 72000.00,
    DiscountPrice = 66999.00,
    StockQuantity = 9,
    CategoryId = @CatSmartphones,
    BrandId = @BrandApple,
    IsActive = 1,
    UpdatedAt = GETUTCDATE()
WHERE Id = 4;

INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
(4, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80', 1, 0),
(4, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&auto=format&fit=crop&q=80', 0, 1),
(4, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1000&auto=format&fit=crop&q=80', 0, 2);

INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
(4, 'Processor', 'Apple A18 Pro (6-core CPU, 6-core GPU, 16-core Neural Engine)'),
(4, 'Memory (RAM)', '8 GB Unified Memory with Apple Intelligence support'),
(4, 'Storage', '256 GB High-Speed NVMe Storage'),
(4, 'Camera System', '48MP Fusion Camera + 48MP Ultra-wide + 12MP 5x Telephoto + Camera Control button'),
(4, 'Display', '6.9" Super Retina XDR OLED, 120Hz ProMotion, Always-On, 2000 nits'),
(4, 'Build & Materials', 'Grade 5 Titanium with Ceramic Shield 2nd generation'),
(4, 'Port & Connectivity', 'USB-C with USB 3 speeds (up to 10Gb/s), Wi-Fi 7, MagSafe'),
(4, 'Warranty', '1 Year Apple Authorized Egypt International Warranty');

-- Helper procedure/block to insert product if not exists
DECLARE @NewPid INT;

-- Product 5: Sony WH-1000XM5
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'SNY-WH1000XM5-BLK')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Midnight Black)',
        'sony-wh-1000xm5-wireless-anc',
        'SNY-WH1000XM5-BLK',
        'Industry-leading noise cancellation powered by two processors and eight microphones. Engineered to perfection with 30mm carbon fiber driver unit, LDAC high-res audio codec, and ultra-comfortable lightweight fit.',
        18500.00, 15999.00, 15, @CatAudio, @BrandSony, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80', 1, 0),
    (@NewPid, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80', 0, 1);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Driver Unit', '30mm High-Precision Dome with Carbon Fiber Composite'),
    (@NewPid, 'Noise Cancellation', 'Integrated Processor V1 + HD Noise Cancelling Processor QN1 with 8 Mics'),
    (@NewPid, 'Audio Codecs', 'LDAC, AAC, SBC (Hi-Res Audio Wireless Certified)'),
    (@NewPid, 'Battery Life', 'Up to 30 Hours (ANC ON), 3-min quick charge gives 3 hours'),
    (@NewPid, 'Connectivity', 'Bluetooth 5.2, Multipoint Connection (2 devices simultaneously)'),
    (@NewPid, 'Warranty', '1 Year Official Sony Warranty');
END

-- Product 6: LG UltraGear 45" Curved OLED Gaming Monitor
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'LG-45GR95QE-OLED')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'LG UltraGear 45" Curved OLED Gaming Monitor (240Hz, 0.03ms, WQHD, 800R)',
        'lg-ultragear-45-curved-oled-240hz',
        'LG-45GR95QE-OLED',
        'Immerse yourself in competitive supremacy. Dramatic 800R curved 45-inch OLED display with blisteringly fast 240Hz refresh rate, near-instantaneous 0.03ms (GtG) response time, and 1,500,000:1 contrast ratio.',
        79000.00, 69999.00, 4, @CatMonitors, @BrandLG, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80', 1, 0),
    (@NewPid, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1000&auto=format&fit=crop&q=80', 0, 1);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Panel Type', '44.5" WQHD (3440 x 1440) OLED with Anti-Glare & Low Reflection'),
    (@NewPid, 'Curvature', 'Dramatic 800R Deep Curve for Panoramic Peripheral Vision'),
    (@NewPid, 'Refresh Rate', '240Hz Ultra-High Native Refresh Rate'),
    (@NewPid, 'Response Time', '0.03ms (GtG) Pure OLED Response'),
    (@NewPid, 'Sync Tech', 'NVIDIA G-SYNC Compatible, AMD FreeSync Premium Pro'),
    (@NewPid, 'Warranty', '3 Years LG Official Warranty (including OLED pixel care)');
END

-- Product 7: Sony PlayStation 5 Pro 2TB
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'SNY-PS5-PRO-2TB')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Sony PlayStation 5 Pro 2TB Console (PlayStation Spectral Super Resolution)',
        'sony-playstation-5-pro-2tb',
        'SNY-PS5-PRO-2TB',
        'Witness breathtaking graphics in compatible games with advanced AI-driven upscaling (PSSR), advanced ray tracing with double the performance, and constant 60/120 FPS high-fidelity gameplay.',
        42000.00, 38500.00, 7, @CatGaming, @BrandSony, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80', 1, 0),
    (@NewPid, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1000&auto=format&fit=crop&q=80', 0, 1);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Graphics Engine', 'Upgraded GPU with 67% more Compute Units & 28% faster memory'),
    (@NewPid, 'Internal Storage', '2 TB Ultra-High Speed Custom PCIe NVMe SSD'),
    (@NewPid, 'AI Upscaling', 'PlayStation Spectral Super Resolution (PSSR) machine learning upscaler'),
    (@NewPid, 'Ray Tracing', 'Advanced Hardware Ray Tracing (up to 3x reflection & refraction speed)'),
    (@NewPid, 'Controller', 'DualSense Wireless Controller with Haptic Feedback & Adaptive Triggers'),
    (@NewPid, 'Warranty', '2 Years Official PlayStation Warranty');
END

-- Product 8: ASUS ROG Zephyrus G16
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'ASUS-G16-RTX4080')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'ASUS ROG Zephyrus G16 (2026 OLED, Core Ultra 9, 32GB, 2TB SSD, RTX 4080)',
        'asus-rog-zephyrus-g16-oled-rtx4080',
        'ASUS-G16-RTX4080',
        'Precision CNC aluminum unibody packed with unmatched gaming firepower. Equipped with ROG Nebula 2.5K 240Hz OLED display, Intel Core Ultra 9 processor with AI NPU, and RTX 4080 graphics with vapor chamber cooling.',
        125000.00, 115000.00, 6, @CatLaptops, @BrandASUS, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000&auto=format&fit=crop&q=80', 1, 0),
    (@NewPid, 'https://images.unsplash.com/photo-1595327656903-2f54e37ce09b?w=1000&auto=format&fit=crop&q=80', 0, 1);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Processor', 'Intel Core Ultra 9 185H (16 Cores, 22 Threads with dedicated NPU)'),
    (@NewPid, 'Graphics (GPU)', 'NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP + MUX Switch)'),
    (@NewPid, 'Display', '16" 2.5K (2560 x 1600) ROG Nebula OLED, 240Hz, 0.2ms, G-Sync'),
    (@NewPid, 'Storage & RAM', '2 TB PCIe 4.0 NVMe + 32 GB LPDDR5X 7467MHz Dual-Channel'),
    (@NewPid, 'Chassis & Audio', 'CNC Aluminum with Slash Lighting, 6-Speaker Dolby Atmos sound'),
    (@NewPid, 'Warranty', '2 Years Official ASUS Perfect Warranty');
END

-- Product 9: Apple iPad Pro 13" M4 OLED
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'APL-IPADP13-M4')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Apple iPad Pro 13" M4 OLED 256GB (Space Black, Wi-Fi 6E)',
        'apple-ipad-pro-13-m4-oled',
        'APL-IPADP13-M4',
        'The thinnest Apple product ever, delivering outrageous performance with the revolutionary Ultra Retina XDR Tandem OLED display and extreme speed from the breakthrough M4 chip.',
        68000.00, 62500.00, 10, @CatSmartphones, @BrandApple, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000&auto=format&fit=crop&q=80', 1, 0);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Processor', 'Apple M4 Chip with 9-core CPU and 10-core GPU with hardware ray tracing'),
    (@NewPid, 'Display', '13" Ultra Retina XDR Tandem OLED, 1000 nits full-screen, 1600 nits peak'),
    (@NewPid, 'Thickness & Weight', 'Unbelievably thin at just 5.1 mm, weighs 579 grams'),
    (@NewPid, 'Accessories Support', 'Supports Apple Pencil Pro and new redesigned Magic Keyboard with function row'),
    (@NewPid, 'Warranty', '1 Year Apple Authorized Warranty');
END

-- Product 10: Keychron Q1 Pro
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'KCH-Q1PRO-WHT')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (QMK/VIA, Hot-swappable)',
        'keychron-q1-pro-wireless-custom-keyboard',
        'KCH-Q1PRO-WHT',
        'An all-metal QMK/VIA wireless mechanical keyboard. Double-gasket mount design, CNC-machined 6063 aluminum body, screw-in stabilizers, and wireless connectivity with up to 3 devices.',
        11500.00, 9800.00, 20, @CatAccessories, @BrandKeychron, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80', 1, 0);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Connectivity', 'Bluetooth 5.1 & Type-C Wired (1000Hz polling rate in wired mode)'),
    (@NewPid, 'Body Material', 'Full CNC Machined Aluminum 6063'),
    (@NewPid, 'Switches', 'Keychron K Pro Red Mechanical Switches (Pre-lubed, Hot-swappable)'),
    (@NewPid, 'Keycaps', 'KSA Double-Shot PBT Keycaps (Non-shine-through)'),
    (@NewPid, 'Warranty', '1 Year Official Warranty');
END

-- Product 11: Logitech MX Master 3S
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'LOG-MXM3S-GRF')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Logitech MX Master 3S Wireless Performance Mouse (8K DPI, Quiet Clicks)',
        'logitech-mx-master-3s-mouse',
        'LOG-MXM3S-GRF',
        'The iconic master mouse remastered. With Quiet Clicks and 8,000 DPI track-on-glass sensor for ultimate tactile feel and precision performance.',
        5800.00, 4950.00, 25, @CatAccessories, @BrandLogitech, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1000&auto=format&fit=crop&q=80', 1, 0);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Sensor', 'Darkfield High Precision 8000 DPI (Works on glass > 4mm)'),
    (@NewPid, 'Scroll Wheel', 'MagSpeed Electromagnetic Wheel (Scrols 1,000 lines in 1 second)'),
    (@NewPid, 'Battery Life', 'Up to 70 days on full charge, 1 min charge gives 3 hours use'),
    (@NewPid, 'Warranty', '2 Years Logitech Egypt Warranty');
END

-- Product 12: Anker Prime 20,000mAh Power Bank
IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'ANK-PRIME-20K-200W')
BEGIN
    INSERT INTO Products (Name, Slug, SKU, Description, Price, DiscountPrice, StockQuantity, CategoryId, BrandId, IsActive, CreatedAt)
    VALUES (
        'Anker Prime 20,000mAh Power Bank (200W Total Output, Smart Digital Display)',
        'anker-prime-20000mah-200w-powerbank',
        'ANK-PRIME-20K-200W',
        'Ultra-high 200W total output with two high-powered USB-C ports (100W each) and one USB-A port. Rapidly recharge a 16-inch MacBook Pro to 50% in just 40 minutes.',
        6500.00, 5400.00, 30, @CatAccessories, @BrandAnker, 1, GETUTCDATE()
    );
    SET @NewPid = SCOPE_IDENTITY();
    INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder) VALUES
    (@NewPid, 'https://images.unsplash.com/photo-1609592426861-1c39c8789311?w=1000&auto=format&fit=crop&q=80', 1, 0);
    INSERT INTO ProductSpecifications (ProductId, Name, Value) VALUES
    (@NewPid, 'Capacity', '20,000 mAh / 72Wh Airline Compliant'),
    (@NewPid, 'Total Output', '200W Maximum Shared Output (Single Port up to 100W)'),
    (@NewPid, 'Recharge Speed', '100W Lightning-Fast Input (recharges from 0 to 100% in 1 hour 15 min)'),
    (@NewPid, 'Display', 'Color Smart Digital Display showing watts, remaining time, and health'),
    (@NewPid, 'Warranty', '24 Months Anker Official Warranty');
END

PRINT 'Database seeded successfully with rich electronic catalog!';

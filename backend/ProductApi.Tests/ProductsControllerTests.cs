using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Controllers;
using ProductApi.Data;
using ProductApi.Models;
using ProductApi.Tests.TestHelpers;
using Xunit;

namespace ProductApi.Tests;

public class ProductsControllerTests
{
    [Fact]
    public async Task GetProducts_FiltersBySearchTerm()
    {
        // Arrange
        var dbName = nameof(GetProducts_FiltersBySearchTerm);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);
        DbContextFactory.SeedProducts(context);

        var controller = new ProductsController(context);

        // Act: search for "mouse"
        var result = await controller.GetProducts("mouse");

        // Assert
        var okResult = Assert.IsType<ActionResult<IEnumerable<Product>>>(result);
        var okObject = Assert.IsType<OkObjectResult>(okResult.Result);
        var products = Assert.IsAssignableFrom<IEnumerable<Product>>(okObject.Value);

        var list = products.ToList();
        Assert.Single(list);
        Assert.Equal("Wireless Mouse", list[0].Name);
    }

    [Fact]
    public async Task CreateProduct_ReturnsBadRequest_WhenIdNotUnique()
    {
        // Arrange
        var dbName = nameof(CreateProduct_ReturnsBadRequest_WhenIdNotUnique);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);
        DbContextFactory.SeedProducts(context);

        var controller = new ProductsController(context);

        var newProductWithExistingId = new Product
        {
            Id = 1, // already used by seeded product
            Name = "Duplicate ID Product",
            Brand = "TestBrand",
            Price = 100,
            Description = "Duplicate ID",
            Stock = 10
        };

        // Force ModelState to be valid (data annotations would pass here)
        controller.ModelState.Clear();

        // Act
        var result = await controller.CreateProduct(newProductWithExistingId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var message = Assert.IsType<string>(badRequest.Value);
        Assert.Equal("Product ID must be unique.", message);
    }

    [Fact]
    public async Task CreateProduct_ReturnsBadRequest_WhenPriceOrStockInvalid()
    {
        // Arrange
        var dbName = nameof(CreateProduct_ReturnsBadRequest_WhenPriceOrStockInvalid);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);

        var controller = new ProductsController(context);

        var invalidProduct = new Product
        {
            Id = 10,
            Name = "Invalid Product",
            Brand = "BadBrand",
            Price = 0,   // invalid: must be > 0
            Description = "Invalid price",
            Stock = -1   // invalid: must be >= 0
        };

        // Let data annotations run
        controller.ModelState.Clear();
        // Simulate validation error: in real pipeline, MVC would populate ModelState based on attributes
        controller.ModelState.AddModelError("Price", "Price must be > 0");
        controller.ModelState.AddModelError("Stock", "Stock must be ≥ 0");

        // Act
        var result = await controller.CreateProduct(invalidProduct);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.IsType<SerializableError>(badRequest.Value);
    }

    [Fact]
    public async Task UpdateProduct_ChangesFields_WhenDataValid()
    {
        // Arrange
        var dbName = nameof(UpdateProduct_ChangesFields_WhenDataValid);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);
        DbContextFactory.SeedProducts(context);

        var controller = new ProductsController(context);

        var existing = await context.Products.FirstAsync(p => p.Id == 2);

        var updated = new Product
        {
            Id = existing.Id, // same ID
            Name = "Updated Mouse",
            Brand = existing.Brand,
            Price = 49,
            Description = "Updated description",
            Stock = 30
        };

        controller.ModelState.Clear();

        // Act
        var result = await controller.UpdateProduct(existing.Id, updated);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Product>(okResult.Value);

        Assert.Equal("Updated Mouse", returned.Name);
        Assert.Equal(49, returned.Price);
        Assert.Equal("Updated description", returned.Description);
        Assert.Equal(30, returned.Stock);

        // Also verify persisted
        var fromDb = await context.Products.FindAsync(existing.Id);
        Assert.NotNull(fromDb);
        Assert.Equal("Updated Mouse", fromDb!.Name);
        Assert.Equal(49, fromDb.Price);
    }

    [Fact]
    public async Task DeleteProduct_RemovesEntity_WhenIdExists()
    {
        // Arrange
        var dbName = nameof(DeleteProduct_RemovesEntity_WhenIdExists);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);
        DbContextFactory.SeedProducts(context);

        var controller = new ProductsController(context);

        // Act
        var result = await controller.DeleteProduct(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Null(await context.Products.FindAsync(1));
    }

    [Fact]
    public async Task DeleteProduct_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Arrange
        var dbName = nameof(DeleteProduct_ReturnsNotFound_WhenIdDoesNotExist);
        using var context = DbContextFactory.CreateInMemoryDbContext(dbName);
        DbContextFactory.SeedProducts(context);

        var controller = new ProductsController(context);

        // Act
        var result = await controller.DeleteProduct(999); // non-existing

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
}

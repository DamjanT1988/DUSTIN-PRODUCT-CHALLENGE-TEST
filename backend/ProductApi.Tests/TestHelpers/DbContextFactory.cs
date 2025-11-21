using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Models;
using System;

namespace ProductApi.Tests.TestHelpers;

public static class DbContextFactory
{
    /// <summary>
    /// Creates a new AppDbContext using EF Core InMemory provider
    /// with a unique database name per test.
    /// </summary>
    public static AppDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new AppDbContext(options);

        return context;
    }

    /// <summary>
    /// Seeds some sample products into the context.
    /// </summary>
    public static void SeedProducts(AppDbContext context)
    {
        context.Products.AddRange(
            new Product
            {
                Id = 1,
                Name = "Laptop 15\"",
                Brand = "TechPro",
                Price = 1299,
                Description = "Powerful laptop",
                Stock = 5
            },
            new Product
            {
                Id = 2,
                Name = "Wireless Mouse",
                Brand = "LogiX",
                Price = 39,
                Description = "Ergonomic mouse",
                Stock = 40
            },
            new Product
            {
                Id = 3,
                Name = "Keyboard",
                Brand = "KeyMaster",
                Price = 79,
                Description = "Mechanical keyboard",
                Stock = 20
            }
        );

        context.SaveChanges();
    }
}

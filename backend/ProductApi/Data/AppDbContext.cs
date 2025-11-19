using Microsoft.EntityFrameworkCore;
using ProductApi.Models;

namespace ProductApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique index on Id
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Id)
            .IsUnique();

        // Seed some data
        modelBuilder.Entity<Product>().HasData(
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
                Description = "Ergonomic wireless mouse",
                Stock = 40
            }
        );
    }
}

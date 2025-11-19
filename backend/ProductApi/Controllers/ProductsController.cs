using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Models;

namespace ProductApi.Controllers;

[ApiController]
[Route("api/[controller]")] // -> api/products
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products?search=...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] string? search)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(p =>
                p.Id.ToString().Contains(search) ||
                p.Name.ToLower().Contains(search) ||
                p.Brand.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.Price.ToString().Contains(search) ||
                p.Stock.ToString().Contains(search));
        }

        var products = await query.OrderBy(p => p.Id).ToListAsync();
        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        // Data annotations validation
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Unique ID check
        var idExists = await _context.Products.AnyAsync(p => p.Id == product.Id);
        if (idExists)
        {
            return BadRequest("Product ID must be unique.");
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // PUT: api/products/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, Product updated)
    {
        if (id != updated.Id)
        {
            // If they change ID in body to another value, we handle below
            // but first check mismatch
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existing = await _context.Products.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        // If user tries to change ID to a different, existing one
        if (updated.Id != id)
        {
            var idTaken = await _context.Products.AnyAsync(p => p.Id == updated.Id);
            if (idTaken)
            {
                return BadRequest("Product ID must be unique.");
            }
        }

        existing.Id = updated.Id;
        existing.Name = updated.Name;
        existing.Brand = updated.Brand;
        existing.Price = updated.Price;
        existing.Description = updated.Description;
        existing.Stock = updated.Stock;

        await _context.SaveChangesAsync();

        return Ok(existing);
    }

    // DELETE: api/products/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

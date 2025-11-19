using System.ComponentModel.DataAnnotations;

namespace ProductApi.Models;

public class Product
{
    [Key]
    public int Id { get; set; }  // Unique ID

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be > 0.")]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stock must be ≥ 0.")]
    public int Stock { get; set; }
}

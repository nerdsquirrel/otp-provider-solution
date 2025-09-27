using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Entities;

namespace WebApi.Practice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OtpProvidersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public OtpProvidersController(ApplicationDbContext db)
        {
            _db = db;
        }

        // Added: delivery type option record
        public record DeliveryTypeOption(string Value, string Label);

        // NEW: GET api/otpproviders/delivery-types
        [HttpGet("delivery-types")]
        public ActionResult<IEnumerable<DeliveryTypeOption>> GetDeliveryTypes()
        {
            // Expose all enum names (string values because JsonStringEnumConverter is configured)
            var values = Enum.GetNames(typeof(OtpMethod))
                .Select(v => new DeliveryTypeOption(v, v))
                .ToList();
            return Ok(values);
        }

        // GET: api/otpproviders?onlyActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OtpProviderDto>>> GetAll([FromQuery] bool onlyActive = false)
        {
            var query = _db.OtpProviders.AsNoTracking();
            if (onlyActive)
                query = query.Where(p => p.IsActive);

            var list = await query
                .OrderBy(p => p.Name)
                .Select(p => p.ToDto())
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/otpproviders/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OtpProviderDto>> GetById(int id)
        {
            var entity = await _db.OtpProviders.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (entity is null)
                return NotFound();

            return Ok(entity.ToDto());
        }

        // POST: api/otpproviders
        [HttpPost]
        public async Task<ActionResult<OtpProviderDto>> Create([FromBody] OtpProviderCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            // Enforce unique Name (aligned with unique index)
            bool nameExists = await _db.OtpProviders
                .AnyAsync(p => p.Name == dto.Name);

            if (nameExists)
                return Conflict($"An OTP provider with name '{dto.Name}' already exists.");

            var entity = new OtpProvider.WebApi.Entities.OtpProvider
            {
                Name = dto.Name,
                Description = dto.Description,
                DeliveryType = dto.DeliveryType,
                IsActive = dto.IsActive,
                ConfigurationJson = dto.ConfigurationJson,
                CreatedAt = DateTime.UtcNow
            };

            _db.OtpProviders.Add(entity);
            await _db.SaveChangesAsync();

            var resultDto = entity.ToDto();
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, resultDto);
        }

        // PUT: api/otpproviders/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<OtpProviderDto>> Update(int id, [FromBody] OtpProviderUpdateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = await _db.OtpProviders.FirstOrDefaultAsync(p => p.Id == id);
            if (entity is null)
                return NotFound();

            bool duplicateName = await _db.OtpProviders
                .AnyAsync(p => p.Id != id && p.Name == dto.Name);

            if (duplicateName)
                return Conflict($"Another OTP provider already uses name '{dto.Name}'.");

            entity.ApplyUpdate(dto);
            await _db.SaveChangesAsync();

            return Ok(entity.ToDto());
        }

        // DELETE: api/otpproviders/5?hard=false
        // soft delete (IsActive = false) by default; hard delete when hard=true
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] bool hard = false)
        {
            var entity = await _db.OtpProviders.FirstOrDefaultAsync(p => p.Id == id);
            if (entity is null)
                return NotFound();

            if (hard)
            {
                _db.OtpProviders.Remove(entity);
            }
            else
            {
                if (!entity.IsActive)
                    return NoContent(); // already inactive
                entity.IsActive = false;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
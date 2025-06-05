using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;

namespace IzjasniSe.Api.Services
{
    public class CityService : ICityService
    {
        private readonly AppDbContext _db;

        public CityService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<IEnumerable<City>> GetAllAsync()
        {
            return await _db.Cities
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<City?> GetByIdAsync(int id)
        {
            return await _db.Cities
                            .Include(c => c.Locations)
                            .Include(c => c.Proposals)
                            .Include(c => c.Moderators)
                            .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<City> CreateAsync(City city)
        {
            city.CreatedAt = DateTime.UtcNow;
            _db.Cities.Add(city);
            await _db.SaveChangesAsync();
            return city;
        }

        public async Task<bool> UpdateAsync(int id, CityUpdateDto cityUpdateDto)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) return false;

            if(cityUpdateDto.Name!= null)
            {
                existing.Name = cityUpdateDto.Name;
            }

            if(cityUpdateDto.Postcode != null)
            {
                existing.Postcode = cityUpdateDto.Postcode;
            }

            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Cities.FindAsync(id);
            if (existing == null) return false;

            _db.Cities.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}

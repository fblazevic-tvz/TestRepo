using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _db;

        public LocationService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Location>> GetAllAsync()
        {
            return await _db.Locations
                            .Include(l => l.City)
                            .Include(l => l.Suggestions)
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<Location?> GetByIdAsync(int id)
        {
            return await _db.Locations
                            .Include(l => l.City)
                            .Include(l => l.Suggestions)
                            .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<Location> CreateAsync(LocationCreateDto locationCreateDto)
        {
            var entity = new Location
            {
                Name = locationCreateDto.Name,
                Address = locationCreateDto.Address,
                Latitude = locationCreateDto.Latitude,
                Longitude = locationCreateDto.Longitude,
                CityId = locationCreateDto.CityId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Locations.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int id,LocationCreateDto locationCreateDto)
        {
            var existingLocation = await GetByIdAsync(id);
            if (existingLocation == null) return false;

            existingLocation.Name = locationCreateDto.Name;
            existingLocation.Address = locationCreateDto.Address;
            existingLocation.Latitude = locationCreateDto.Latitude;
            existingLocation.Longitude = locationCreateDto.Longitude;
            existingLocation.CityId = locationCreateDto.CityId;
            existingLocation.UpdatedAt = DateTime.UtcNow;

            _db.Locations.Update(existingLocation);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) return false;

            _db.Locations.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}

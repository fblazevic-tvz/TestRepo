using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ILocationService
    {
        Task<IEnumerable<Location>> GetAllAsync();
        Task<Location?> GetByIdAsync(int id);
        Task<Location> CreateAsync(LocationCreateDto location);
        Task<bool> UpdateAsync(int id, LocationCreateDto location);
        Task<bool> DeleteAsync(int id);
    }
}

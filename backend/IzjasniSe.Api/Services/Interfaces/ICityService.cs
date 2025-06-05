using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ICityService
    {
        Task<IEnumerable<City>> GetAllAsync();
        Task<City?> GetByIdAsync(int id);
        Task<City> CreateAsync(City city);
        Task<bool> UpdateAsync(int id, CityUpdateDto cityUpdateDto);
        Task<bool> DeleteAsync(int id);
    }
}

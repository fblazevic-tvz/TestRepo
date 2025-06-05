using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<UserReadDto> CreateAsync(UserCreateDto userCreateDto);
        Task<bool> UpdateAsync(int id, UserUpdateDto userUpdateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> CheckUniqueness(string? username, string? email);
        Task<bool> ModeratorExistsAsync(int id);
    }
}

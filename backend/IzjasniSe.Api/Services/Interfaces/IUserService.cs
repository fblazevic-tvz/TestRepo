using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserReadDto>> GetAllAsync();
        Task<UserReadDto?> GetByIdAsync(int id);
        Task<UserReadDto> CreateAsync(UserCreateDto userCreateDto);
        Task<bool> UpdateAsync(int id, UserUpdateDto userUpdateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ChangeStatusAsync(int id, UserAccountStatus status);
        Task<bool> CheckUniqueness(string? username, string? email);
        Task<bool> ModeratorExistsAsync(int id);
        Task<bool> UpdateAvatarAsync(int id, string avatarUrl);
    }
}

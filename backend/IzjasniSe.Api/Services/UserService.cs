using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Enums;
using Microsoft.AspNetCore.Identity;

namespace IzjasniSe.Api.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _db.Users
                            .Include(u => u.City)
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _db.Users
                            .Include(u => u.City)
                            .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<UserReadDto> CreateAsync(UserCreateDto userCreateDto)
        {
            var entity = new User {
                UserName = userCreateDto.UserName,
                Email = userCreateDto.Email,
                Role = userCreateDto.Role,
                CityId = userCreateDto.CityId,
                AccountStatus = UserAccountStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            entity.PasswordHash = _passwordHasher.HashPassword(entity, userCreateDto.Password);

            _db.Users.Add(entity);
            await _db.SaveChangesAsync();

            var result = new UserReadDto
            {
                Id = entity.Id,
                UserName = entity.UserName,
                Email = entity.Email,
                Role = entity.Role,
                AccountStatus = entity.AccountStatus,
                CityId = entity.CityId
            };

            return result;
        }

        public async Task<bool> UpdateAsync(int id, UserUpdateDto userUpdateDto)
        {
            var existingUser = await GetByIdAsync(id);
            if (existingUser == null) return false;

            if (!string.IsNullOrEmpty(userUpdateDto.Email))
            {
                existingUser.Email = userUpdateDto.Email;
            }

            if (!string.IsNullOrEmpty(userUpdateDto.NewPassword))
            {
                existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, userUpdateDto.NewPassword);
            }

            if (userUpdateDto.AccountStatus != null)
            {
                existingUser.AccountStatus = (UserAccountStatus)userUpdateDto.AccountStatus;
            }

            existingUser.UpdatedAt = DateTime.UtcNow;

            _db.Users.Update(existingUser);
            if (!string.IsNullOrEmpty(userUpdateDto.Email) &&
                await _db.Users.AnyAsync(u => u.Email == userUpdateDto.Email && u.Id != id))
            {
                throw new InvalidOperationException("Email is already in use.");
            }
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Users.FindAsync(id);
            if (existing == null) return false;

            _db.Users.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckUniqueness(string? username, string? email)
        {
            var exists = await _db.Users
                .AnyAsync(u => (username != null && u.UserName == username) ||
                               (email != null && u.Email == email));
           
            return !exists;
        }

        public async Task<bool> ModeratorExistsAsync(int id)
        {
            return await _db.Users
                .AnyAsync(u => u.Id == id && u.Role == UserRole.Moderator);
        }
    }
}

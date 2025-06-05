using Microsoft.EntityFrameworkCore;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.DAL
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<City> Cities { get; set; } = null!;
        public DbSet<Location> Locations { get; set; } = null!;
        public DbSet<Proposal> Proposals { get; set; } = null!;
        public DbSet<Suggestion> Suggestions { get; set; } = null!;
        public DbSet<Vote> Votes { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Notice> Notices { get; set; } = null!;
        public DbSet<Model.Entities.Attachment> Attachments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Vote>()
                .HasKey(v => new { v.UserId, v.SuggestionId });

            builder.Entity<User>()
                .HasMany(u => u.AuthoredSuggestions)
                .WithOne(s => s.Author)
                .HasForeignKey(s => s.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<User>()
                .HasMany(u => u.Votes)
                .WithOne(v => v.User)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<User>()
                .HasMany(u => u.AuthoredComments)
                .WithOne(c => c.Author)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<User>()
                .HasMany(u => u.ManagedProposals)
                .WithOne(p => p.Moderator)
                .HasForeignKey(p => p.ModeratorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<User>()
                .HasMany(u => u.AuthoredNotices)
                .WithOne(n => n.Moderator)
                .HasForeignKey(n => n.ModeratorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<User>()
                .HasOne(u => u.City)
                .WithMany(c => c.Moderators)
                .HasForeignKey(u => u.CityId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<City>()
                .HasMany(c => c.Proposals)
                .WithOne(p => p.City)
                .HasForeignKey(p => p.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<City>()
                .HasMany(c => c.Locations)
                .WithOne(l => l.City)
                .HasForeignKey(l => l.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Proposal>()
                .HasMany(p => p.Suggestions)
                .WithOne(s => s.Proposal)
                .HasForeignKey(s => s.ProposalId)
                .OnDelete(DeleteBehavior.Cascade); 

            builder.Entity<Proposal>()
                .HasMany(p => p.Notices)
                .WithOne(n => n.Proposal)
                .HasForeignKey(n => n.ProposalId)
                .OnDelete(DeleteBehavior.Cascade); 

            builder.Entity<Suggestion>()
                .HasMany(s => s.Votes)
                .WithOne(v => v.Suggestion)
                .HasForeignKey(v => v.SuggestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Suggestion>()
                .HasMany(s => s.Comments)
                .WithOne(c => c.Suggestion)
                .HasForeignKey(c => c.SuggestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Suggestion>()
                .HasMany(s => s.Attachments)
                .WithOne(a => a.Suggestion)
                .HasForeignKey(a => a.SuggestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Location>()
                .HasMany(l => l.Suggestions)
                .WithOne(s => s.Location)
                .HasForeignKey(s => s.LocationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Comment>()
                .HasMany(c => c.Replies)
                .WithOne(c => c.ParentComment)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            builder.Entity<Proposal>()
                .HasIndex(p => p.CityId);

            builder.Entity<Suggestion>()
                .HasIndex(s => s.ProposalId);

            builder.Entity<Suggestion>()
                .HasIndex(s => s.AuthorId);

            builder.Entity<Suggestion>()
                .HasIndex(s => s.LocationId);

            builder.Entity<Comment>()
               .HasIndex(c => c.SuggestionId);

            builder.Entity<Comment>()
               .HasIndex(c => c.ParentCommentId);
        }
    }

}

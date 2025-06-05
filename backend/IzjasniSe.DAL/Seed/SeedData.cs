using IzjasniSe.Model.Entities;
using IzjasniSe.Model.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace IzjasniSe.DAL.Seed
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

                try
                {
                    if (await context.Users.AnyAsync())
                    {
                        logger.LogInformation("Database already seeded.");
                        return;
                    }
                    logger.LogInformation("Initializing seed data...");
                    await SeedDatabaseAsync(context);
                    logger.LogInformation("Seed data initialization complete.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred during database seeding.");
                }
            }
        }

        private static async Task SeedDatabaseAsync(AppDbContext context)
        {
            var passwordHasher = new PasswordHasher<User>();

            var zagreb = new City { Name = "Zagreb", Postcode = "10000", CreatedAt = DateTime.UtcNow };
            var split = new City { Name = "Split", Postcode = "21000", CreatedAt = DateTime.UtcNow };
            var rijeka = new City { Name = "Rijeka", Postcode = "51000", CreatedAt = DateTime.UtcNow };
            var osijek = new City { Name = "Osijek", Postcode = "31000", CreatedAt = DateTime.UtcNow };
            var zadar = new City { Name = "Zadar", Postcode = "23000", CreatedAt = DateTime.UtcNow };
            var pula = new City { Name = "Pula", Postcode = "52100", CreatedAt = DateTime.UtcNow };
            var varazdin = new City { Name = "Varaždin", Postcode = "42000", CreatedAt = DateTime.UtcNow };
            var dubrovnik = new City { Name = "Dubrovnik", Postcode = "20000", CreatedAt = DateTime.UtcNow };
            var sibenik = new City { Name = "Šibenik", Postcode = "22000", CreatedAt = DateTime.UtcNow };
            var karlovac = new City { Name = "Karlovac", Postcode = "47000", CreatedAt = DateTime.UtcNow };

            var cities = new List<City> { zagreb, split, rijeka, osijek, zadar, pula, varazdin, dubrovnik, sibenik, karlovac };
            await context.Cities.AddRangeAsync(cities);
            await context.SaveChangesAsync();


            var adminUser = new User { UserName = "admin", Email = "admin@izjasnise.hr", Role = UserRole.Admin, AccountStatus = UserAccountStatus.Active, City = null, CreatedAt = DateTime.UtcNow };
            var modZg = new User { UserName = "moderatorZg", Email = "moderator@zg.izjasnise.hr", Role = UserRole.Moderator, AccountStatus = UserAccountStatus.Active, City = zagreb, CreatedAt = DateTime.UtcNow };
            var user1 = new User { UserName = "korisnik1", Email = "korisnik1@email.com", Role = UserRole.Regular, AccountStatus = UserAccountStatus.Active, City = zagreb, CreatedAt = DateTime.UtcNow };
            var user2 = new User { UserName = "korisnik2", Email = "korisnik2@email.com", Role = UserRole.Regular, AccountStatus = UserAccountStatus.Active, City = split, CreatedAt = DateTime.UtcNow };
            var user3 = new User { UserName = "korisnik3", Email = "korisnik3@email.com", Role = UserRole.Regular, AccountStatus = UserAccountStatus.Active, City = rijeka, CreatedAt = DateTime.UtcNow };

            var users = new List<User> { adminUser, modZg, user1, user2, user3 };

            users[0].PasswordHash = passwordHasher.HashPassword(users[0], "AdminPass123!");
            users[1].PasswordHash = passwordHasher.HashPassword(users[1], "ModeratorPass123!");
            users[2].PasswordHash = passwordHasher.HashPassword(users[2], "Korisnik1Pass!");
            users[3].PasswordHash = passwordHasher.HashPassword(users[3], "Korisnik2Pass!");
            users[4].PasswordHash = passwordHasher.HashPassword(users[4], "Korisnik3Pass!");

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();


            var locations = new List<Location>
            {
                new Location { Name = "Trg bana Jelačića", Address="Trg bana Josipa Jelačića", City = zagreb, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Park Maksimir - Glavni ulaz", Address="Maksimirski perivoj", City = zagreb, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Bundek - Glavno jezero", Address="Bundek", City = zagreb, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Riva - Glavna šetnica", Address="Obala Hrvatskog narodnog preporoda", City = split, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Plaža Bačvice", Address="Prilaz braće Kaliterna", City = split, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Korzo - Centar", Address="Korzo", City = rijeka, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Trsat - Gradina", Address="Petra Zrinskog", City = rijeka, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Tvrđa - Trg Sv. Trojstva", Address="Trg Svetog Trojstva", City = osijek, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Promenada uz Dravu", Address="Šetalište kardinala Franje Šepera", City = osijek, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Forum", Address="Poljana pape Aleksandra III", City = zadar, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Pozdrav Suncu", Address="Istarska obala", City = zadar, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Arena Pula", Address="Flavijevska ulica", City = pula, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Stari grad Varaždin", Address="Šetalište Josipa Jurja Strossmayera", City = varazdin, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Stradun", Address="Stradun", City = dubrovnik, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Katedrala sv. Jakova", Address="Trg Republike Hrvatske", City = sibenik, CreatedAt = DateTime.UtcNow },
                new Location { Name = "Stari grad Dubovac", Address="Zagrebačka ulica", City = karlovac, CreatedAt = DateTime.UtcNow },
            };
            await context.Locations.AddRangeAsync(locations);
            await context.SaveChangesAsync();

            var proposal1 = new Proposal { Name = "Obnova dječjeg igrališta Maksimir", Description = "Zamjena starih sprava i postavljanje nove gumene podloge.", MaxBudget = 50000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-30), SubmissionEnd = DateTime.UtcNow.AddDays(30), Status = ProposalStatus.Active, City = zagreb, Moderator = modZg, CreatedAt = DateTime.UtcNow.AddDays(-35) };
            var proposal2 = new Proposal { Name = "Postavljanje javnih klupa na Rivi", Description = "Dodavanje 15 novih klupa duž splitske Rive.", MaxBudget = 15000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-20), SubmissionEnd = DateTime.UtcNow.AddDays(10), Status = ProposalStatus.Active, City = split, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-25) };
            var proposal3 = new Proposal { Name = "Biciklistička staza uz Korzo", Description = "Izgradnja označene biciklističke staze u centru Rijeke.", MaxBudget = 120000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-60), SubmissionEnd = DateTime.UtcNow.AddDays(60), Status = ProposalStatus.Active, City = rijeka, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-65) };
            var proposal4 = new Proposal { Name = "Ozelenjavanje Trga Sv. Trojstva", Description = "Sadnja novih stabala i cvijeća u osječkoj Tvrđi.", MaxBudget = 25000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-45), SubmissionEnd = DateTime.UtcNow.AddDays(-5), Status = ProposalStatus.Closed, City = osijek, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-50) };
            var proposal5 = new Proposal { Name = "Postavljanje punionica za električne romobile", Description = "Instalacija 5 stanica za punjenje el. romobila na ključnim lokacijama u Zadru.", MaxBudget = 30000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-10), SubmissionEnd = DateTime.UtcNow.AddDays(50), Status = ProposalStatus.Active, City = zadar, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-15) };
            var proposal6 = new Proposal { Name = "Uređenje šetnice Lungomare", Description = "Popravak oštećenih dijelova šetnice i postavljanje nove rasvjete.", MaxBudget = 75000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-90), SubmissionEnd = DateTime.UtcNow.AddDays(-30), Status = ProposalStatus.Closed, City = pula, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-95) };
            var proposal7 = new Proposal { Name = "Program 'Čitam ti priču' u parkovima", Description = "Organizacija čitanja priča za djecu u gradskim parkovima tijekom ljeta.", MaxBudget = 5000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-5), SubmissionEnd = DateTime.UtcNow.AddDays(25), Status = ProposalStatus.Active, City = zagreb, Moderator = modZg, CreatedAt = DateTime.UtcNow.AddDays(-10) };
            var proposal8 = new Proposal { Name = "Postavljanje reciklažnih otoka", Description = "Povećanje broja reciklažnih otoka za papir, plastiku i staklo.", MaxBudget = 40000.00m, SubmissionStart = DateTime.UtcNow.AddDays(-70), SubmissionEnd = DateTime.UtcNow.AddDays(20), Status = ProposalStatus.Active, City = varazdin, Moderator = null, CreatedAt = DateTime.UtcNow.AddDays(-75) };

            var proposals = new List<Proposal> { proposal1, proposal2, proposal3, proposal4, proposal5, proposal6, proposal7, proposal8 };
            await context.Proposals.AddRangeAsync(proposals);
            await context.SaveChangesAsync();

            var locMaksimir = locations.First(l => l.Name.Contains("Maksimir"));
            var locBundek = locations.First(l => l.Name.Contains("Bundek"));
            var locRiva = locations.First(l => l.Name.Contains("Riva"));
            var locKorzo = locations.First(l => l.Name.Contains("Korzo"));
            var locTvrdja = locations.First(l => l.Name.Contains("Tvrđa"));
            var locForum = locations.First(l => l.Name.Contains("Forum"));
            var locPozdrav = locations.First(l => l.Name.Contains("Pozdrav Suncu"));
            var locStariGradVa = locations.First(l => l.Name.Contains("Stari grad Varaždin"));

            var suggestions = new List<Suggestion>
            {
                new Suggestion { Name = "Nove ljuljačke", Description = "Potrebne su nove, sigurnije ljuljačke.", EstimatedCost = 3500.00m, Status = SuggestionStatus.Submitted, Proposal = proposal1, Author = user1, Location = locMaksimir, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Suggestion { Name = "Tobogan za manju djecu", Description = "Dodati manji tobogan primjeren za djecu do 3 godine.", EstimatedCost = 4200.00m, Status = SuggestionStatus.Submitted, Proposal = proposal1, Author = user1, Location = locMaksimir, CreatedAt = DateTime.UtcNow.AddDays(-24) },
                new Suggestion { Name = "Klupe s naslonom", Description = "Sve nove klupe trebaju imati naslon za leđa.", EstimatedCost = 800.00m, Status = SuggestionStatus.Submitted, Proposal = proposal2, Author = user2, Location = locRiva, CreatedAt = DateTime.UtcNow.AddDays(-18) },
                new Suggestion { Name = "Klupe sa sjenilom", Description = "Barem nekoliko klupa treba imati nadstrešnicu ili sjenilo.", EstimatedCost = 1500.00m, Status = SuggestionStatus.UnderReview, Proposal = proposal2, Author = user2, Location = locRiva, CreatedAt = DateTime.UtcNow.AddDays(-17) },
                new Suggestion { Name = "Jasno odvojiti stazu", Description = "Biciklistička staza mora biti jasno odvojena bojom i oznakama od pješačke zone.", EstimatedCost = 10000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal3, Author = user3, Location = locKorzo, CreatedAt = DateTime.UtcNow.AddDays(-55) },
                new Suggestion { Name = "Postolja za bicikle", Description = "Postaviti više stalaka za parkiranje bicikala uz stazu.", EstimatedCost = 5000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal3, Author = user3, Location = locKorzo, CreatedAt = DateTime.UtcNow.AddDays(-50) },
                new Suggestion { Name = "Popravak postojeće penjalice", Description = "Drvena penjalica je oštećena i treba popravak.", EstimatedCost = 2000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal1, Author = user1, Location = locMaksimir, CreatedAt = DateTime.UtcNow.AddDays(-22) },
                new Suggestion { Name = "Gumena podloga ispod svega", Description = "Cijelo igralište treba imati sigurnu gumenu podlogu.", EstimatedCost = 25000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal1, Author = user1, Location = locMaksimir, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Suggestion { Name = "Čitanje u Maksimiru", Description = "Organizirati čitanje priča kod glavnog ulaza u Maksimir.", EstimatedCost = 200.00m, Status = SuggestionStatus.Submitted, Proposal = proposal7, Author = user1, Location = locMaksimir, CreatedAt = DateTime.UtcNow.AddDays(-4) },
                new Suggestion { Name = "Čitanje na Bundeku", Description = "Organizirati čitanje priča uz jezero Bundek.", EstimatedCost = 200.00m, Status = SuggestionStatus.Submitted, Proposal = proposal7, Author = user1, Location = locBundek, CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new Suggestion { Name = "Više ruža", Description = "Posaditi više vrsta ruža oko spomenika.", EstimatedCost = 1500.00m, Status = SuggestionStatus.Submitted, Proposal = proposal4, Author = user2, Location = locTvrdja, CreatedAt = DateTime.UtcNow.AddDays(-40) },
                new Suggestion { Name = "Punionice kod Foruma", Description = "Jedna punionica treba biti blizu Foruma.", EstimatedCost = 6000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal5, Author = user3, Location = locForum, CreatedAt = DateTime.UtcNow.AddDays(-8) },
                new Suggestion { Name = "Punionice na Pozdrav Suncu", Description = "Druga punionica kod Pozdrava Suncu.", EstimatedCost = 6000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal5, Author = user3, Location = locPozdrav, CreatedAt = DateTime.UtcNow.AddDays(-7) },
                new Suggestion { Name = "Otoci kod Starog grada", Description = "Postaviti jedan set reciklažnih otoka blizu Starog grada.", EstimatedCost = 8000.00m, Status = SuggestionStatus.Submitted, Proposal = proposal8, Author = user1, Location = locStariGradVa, CreatedAt = DateTime.UtcNow.AddDays(-60) },
            };
            await context.Suggestions.AddRangeAsync(suggestions);
            await context.SaveChangesAsync();

            var votes = new List<Vote>
            {
                new Vote { User = adminUser, Suggestion = suggestions[0], CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new Vote { User = adminUser, Suggestion = suggestions[4], CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new Vote { User = modZg, Suggestion = suggestions[0], CreatedAt = DateTime.UtcNow.AddDays(-9) },
                new Vote { User = modZg, Suggestion = suggestions[8], CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new Vote { User = modZg, Suggestion = suggestions[9], CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new Vote { User = user1, Suggestion = suggestions[2], CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Vote { User = user1, Suggestion = suggestions[3], CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Vote { User = user1, Suggestion = suggestions[4], CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Vote { User = user1, Suggestion = suggestions[11], CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Vote { User = user1, Suggestion = suggestions[12], CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Vote { User = user2, Suggestion = suggestions[0], CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Vote { User = user2, Suggestion = suggestions[1], CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Vote { User = user2, Suggestion = suggestions[6], CreatedAt = DateTime.UtcNow.AddDays(-19) },
                new Vote { User = user2, Suggestion = suggestions[10], CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Vote { User = user3, Suggestion = suggestions[0], CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Vote { User = user3, Suggestion = suggestions[3], CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new Vote { User = user3, Suggestion = suggestions[6], CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new Vote { User = user3, Suggestion = suggestions[7], CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new Vote { User = user3, Suggestion = suggestions[13], CreatedAt = DateTime.UtcNow.AddDays(-50) },
            };
            await context.Votes.AddRangeAsync(votes.DistinctBy(v => new { v.UserId, v.SuggestionId }));

            var comment1 = new Comment { Content = "Odlična ideja, ljuljačke su stvarno dotrajale.", IsVisible = true, Suggestion = suggestions[0], Author = user2, CreatedAt = DateTime.UtcNow.AddDays(-20) };
            var comment2 = new Comment { Content = "Slažem se, sigurnost djece je najvažnija.", IsVisible = true, Suggestion = suggestions[0], Author = user3, CreatedAt = DateTime.UtcNow.AddDays(-19) };
            var comment3 = new Comment { Content = "Definitivno trebaju nasloni.", IsVisible = true, Suggestion = suggestions[2], Author = user1, CreatedAt = DateTime.UtcNow.AddDays(-14) };
            var comment4 = new Comment { Content = "Možda neki moderniji dizajn?", IsVisible = true, Suggestion = suggestions[2], Author = user3, CreatedAt = DateTime.UtcNow.AddDays(-13) };
            var comment5 = new Comment { Content = "Ovo bi stvarno poboljšalo biciklističku infrastrukturu.", IsVisible = true, Suggestion = suggestions[4], Author = user1, CreatedAt = DateTime.UtcNow.AddDays(-40) };

            var comments = new List<Comment> { comment1, comment2, comment3, comment4, comment5 };

            await context.Comments.AddRangeAsync(comments);
            await context.SaveChangesAsync();

            var replies = new List<Comment> {
                 new Comment { Content = "A što je s klackalicom?", IsVisible = true, Suggestion = suggestions[0], Author = user2, CreatedAt = DateTime.UtcNow.AddDays(-18), ParentComment = comment1 },
                 new Comment { Content = "I nju bi trebalo pogledati.", IsVisible = true, Suggestion = suggestions[0], Author = user1, CreatedAt = DateTime.UtcNow.AddDays(-17), ParentComment = comment1 },
                  new Comment { Content = "Slažem se!", IsVisible = true, Suggestion = suggestions[2], Author = user1, CreatedAt = DateTime.UtcNow.AddDays(-12), ParentComment = comment4 },

             };
            await context.Comments.AddRangeAsync(replies);

            var notices = new List<Notice>
            {
                new Notice { Title = "Produljen rok za prijedloge - Igralište Maksimir", Content = "Rok za predaju prijedloga za natječaj 'Obnova dječjeg igrališta Maksimir' produljen je do kraja idućeg tjedna.", Proposal = proposal1, Moderator = modZg, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Notice { Title = "Status prijava za čitanje priča", Content = "Zaprimili smo velik broj prijava volontera. Hvala svima! Uskoro ćemo objaviti raspored.", Proposal = proposal7, Moderator = modZg, CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new Notice { Title = "Podsjetnik: Glasanje u tijeku", Content = "Glasanje za prijedloge za natječaj 'Obnova dječjeg igrališta Maksimir' je otvoreno!", Proposal = proposal1, Moderator = modZg, CreatedAt = DateTime.UtcNow.AddDays(-5) },
            };
            await context.Notices.AddRangeAsync(notices);

            var attachments = new List<Model.Entities.Attachment>
            {
                 new Model.Entities.Attachment { FilePathOrUrl = "/attachments/placeholder/ljuljacke_stare.jpg", FileName = "ljuljacke_stare.jpg", ContentType="image/jpeg", FileSize=102400, Suggestion = suggestions[0], CreatedAt=DateTime.UtcNow.AddDays(-25)},
                 new Model.Entities.Attachment { FilePathOrUrl = "/attachments/placeholder/plan_tlocrt.pdf", FileName = "plan_tlocrt.pdf", ContentType="application/pdf", FileSize=512000, Suggestion = suggestions[0], CreatedAt=DateTime.UtcNow.AddDays(-25)},
            };
            await context.Attachments.AddRangeAsync(attachments);

            await context.SaveChangesAsync();
        }
    }
}
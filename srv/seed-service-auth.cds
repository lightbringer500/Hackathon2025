using { SeedService } from './seed-service';

annotate SeedService.present with @(requires: 'user');
annotate SeedService.Rates with @(requires: 'user');

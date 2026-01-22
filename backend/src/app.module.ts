import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Comment } from './comments/entities/comment.entity';
import { Category } from './categories/entities/category.entity';
import { Media } from './media/entities/media.entity';
import { Match } from './matches/entities/match.entity';
import { Bet } from './bets/entities/bet.entity';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { BetsModule } from './bets/bets.module';
import { MatchesModule } from './matches/matches.module';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      validate,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Post,
      Comment,
      Category,
      Media,
      Match,
      Bet,
    ]),
    AuthModule,
    BetsModule,
    MatchesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    AuthModule
  ],
})
export class AppModule {}

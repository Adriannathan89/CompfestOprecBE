import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    AuthModule,
    SubjectModule,
  ],
})
export class AppModule {}

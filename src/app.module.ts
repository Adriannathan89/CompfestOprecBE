import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SubjectModule } from './subject/subject.module';
import { ClassModule } from './class/class.module';
import { StudentTakingClassFormModule } from './studentTakingClassForm/studentTakingClassForm.module';
import { ScheduleModule } from './schedule/shedule.module';
import { ScoringComponentModule } from './scoringComponent/scoringComponent.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    AuthModule,
    SubjectModule,
    ClassModule,
    StudentTakingClassFormModule,
    ScheduleModule,
    ScoringComponentModule
  ],
})
export class AppModule {}

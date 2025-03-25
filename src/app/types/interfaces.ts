import { Classification } from './classification.enum';

export interface TimestampedLog {
  label: Classification;
  accuracy_intake_medicine: number;
  accuracy_motionless: number;
  accuracy_put_away: number;
  accuracy_slide: number;
  timestamp: Date;
}

export interface Log {
  label: Classification;
  accuracy_intake_medicine: number;
  accuracy_motionless: number;
  accuracy_put_away: number;
  accuracy_slide: number;
}

//{"label":"intake medicine","accuracy_intake medicine":0.9961,"accuracy_motionless":0.0000,"accuracy_put away":0.0000,"accuracy_slide":0.0000}

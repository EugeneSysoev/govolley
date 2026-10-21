import { Injectable } from '@nestjs/common';

@Injectable()
export class TrainingClock {
  now(): number {
    return Date.now();
  }
}

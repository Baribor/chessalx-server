import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Database } from 'firebase-admin/database';

@Injectable()
export class FirebaseService {
  private db: Database;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.db = firebaseApp.database();
  }

  getDatabase(): Database {
    return this.db;
  }
}

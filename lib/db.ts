import { ID, Permission, Role, Query } from 'appwrite';
import { databases, APPWRITE_DB_ID, CLASSROOMS_COLLECTION_ID, STUDENTS_COLLECTION_ID } from './appwrite';
import { Classroom, Student } from '../types';

export const db = {
  /**
   * Fetches all classrooms and their respective students, hydrating the Zustand store.
   */
  async fetchClassrooms(teacherId: string): Promise<Classroom[]> {
    try {
      // 1. Fetch Classrooms
      const classesResponse = await databases.listDocuments(
        APPWRITE_DB_ID,
        CLASSROOMS_COLLECTION_ID,
        [Query.equal('teacherId', teacherId)]
      );

      const classrooms: Classroom[] = [];

      for (const doc of classesResponse.documents) {
        // Parse the complex JSON data stuffed into 'settings'
        const complexData = doc.settings ? JSON.parse(doc.settings) : {};

        // 2. Fetch Students for this classroom
        const studentsResponse = await databases.listDocuments(
          APPWRITE_DB_ID,
          STUDENTS_COLLECTION_ID,
          [
            Query.equal('classroomId', doc.$id),
            Query.limit(500) // Adjust if classes are >500
          ]
        );

        const students: Student[] = studentsResponse.documents.map(sDoc => ({
          id: sDoc.$id,
          rollNumber: sDoc.rollNumber,
          name: sDoc.name,
          department: sDoc.department || '',
          section: sDoc.section || '',
          points: sDoc.points || 0,
          drawCount: sDoc.drawCount || 0,
          isSelected: false, // Strictly overridden to false per offline-first fresh session architecture
          isSkipped: false
        }));

        classrooms.push({
          id: doc.$id,
          name: doc.name,
          department: doc.department || '',
          section: doc.section || '',
          semester: doc.semester || '',
          academicYear: doc.academicYear || '',
          description: doc.description || '',
          createdAt: doc.$createdAt,
          updatedAt: doc.$updatedAt,
          settings: complexData.settings || {},
          history: complexData.history || [],
          teams: complexData.teams || [],
          lottery: complexData.lottery || [],
          analytics: complexData.analytics || [],
          leaderboard: complexData.leaderboard || [],
          students: students,
          isDirty: false
        });
      }

      return classrooms;
    } catch (e) {
      console.error('Failed to fetch classrooms from Appwrite', e);
      throw e;
    }
  },

  /**
   * Creates a new classroom document and sets document-level security.
   */
  async createClassroom(classroom: Classroom, teacherId: string): Promise<void> {
    try {
      const permissions = [
        Permission.read(Role.user(teacherId)),
        Permission.update(Role.user(teacherId)),
        Permission.delete(Role.user(teacherId))
      ];

      // Package non-primitive arrays/objects into the settings JSON blob
      const complexData = {
        settings: classroom.settings,
        history: classroom.history,
        teams: classroom.teams,
        lottery: classroom.lottery,
        analytics: classroom.analytics,
        leaderboard: classroom.leaderboard,
      };

      await databases.createDocument(
        APPWRITE_DB_ID,
        CLASSROOMS_COLLECTION_ID,
        classroom.id, // Keep IDs synced
        {
          name: classroom.name,
          department: classroom.department || null,
          section: classroom.section || null,
          semester: classroom.semester || null,
          academicYear: classroom.academicYear || null,
          description: classroom.description || null,
          teacherId: teacherId,
          settings: JSON.stringify(complexData)
        },
        permissions
      );
    } catch (e) {
      console.error('Failed to create classroom in Appwrite', e);
      throw e;
    }
  },

  /**
   * Robust sync function that bulk-updates the classroom and its students.
   * Conflict Resolution TODO: Currently Last Write Wins. Add version hashing.
   */
  async saveClassroomState(classroom: Classroom, teacherId: string): Promise<void> {
    try {
      // 1. Update Classroom Metadata & Complex JSON
      const complexData = {
        settings: classroom.settings,
        history: classroom.history,
        teams: classroom.teams,
        lottery: classroom.lottery,
        analytics: classroom.analytics,
        leaderboard: classroom.leaderboard,
      };

      await databases.updateDocument(
        APPWRITE_DB_ID,
        CLASSROOMS_COLLECTION_ID,
        classroom.id,
        {
          name: classroom.name,
          department: classroom.department || null,
          section: classroom.section || null,
          semester: classroom.semester || null,
          academicYear: classroom.academicYear || null,
          description: classroom.description || null,
          settings: JSON.stringify(complexData)
        }
      );

      // 2. Sync Students (Appwrite Client SDK doesn't natively support bulk upsert)
      // To avoid rate limits (e.g., 60 req/min on free tier), we process students in small chunks
      const permissions = [
        Permission.read(Role.user(teacherId)),
        Permission.update(Role.user(teacherId)),
        Permission.delete(Role.user(teacherId))
      ];

      const CHUNK_SIZE = 5;
      const DELAY_MS = 300;

      for (let i = 0; i < classroom.students.length; i += CHUNK_SIZE) {
        const chunk = classroom.students.slice(i, i + CHUNK_SIZE);
        
        const chunkPromises = chunk.map(async (student) => {
          try {
            await databases.updateDocument(
              APPWRITE_DB_ID,
              STUDENTS_COLLECTION_ID,
              student.id,
              {
                rollNumber: student.rollNumber,
                name: student.name,
                department: student.department || null,
                section: student.section || null,
                points: student.points || 0,
                drawCount: student.drawCount || 0
              }
            );
          } catch (updateErr: any) {
            if (updateErr?.code === 404) {
              await databases.createDocument(
                APPWRITE_DB_ID,
                STUDENTS_COLLECTION_ID,
                student.id,
                {
                  classroomId: classroom.id,
                  rollNumber: student.rollNumber,
                  name: student.name,
                  department: student.department || null,
                  section: student.section || null,
                  points: student.points || 0,
                  drawCount: student.drawCount || 0
                },
                permissions
              );
            } else {
              throw updateErr;
            }
          }
        });

        await Promise.all(chunkPromises);
        
        // Wait before processing the next chunk if there are more
        if (i + CHUNK_SIZE < classroom.students.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

    } catch (e) {
      console.error('Failed to sync classroom state to Appwrite', e);
      throw e;
    }
  },

  /**
   * Deletes a classroom.
   */
  async deleteClassroom(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        APPWRITE_DB_ID,
        CLASSROOMS_COLLECTION_ID,
        id
      );
    } catch (e) {
      console.error('Failed to delete classroom from Appwrite', e);
      throw e;
    }
  }
};

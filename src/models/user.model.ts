import { pool } from "../config/database";
import { IUser, IUserCreate, IUserUpdate } from "../types/custom";

export class UserModel {
  static async create(
    userData: Omit<IUserCreate, "password"> & { passwordHash: string }
  ): Promise<IUser> {
    const query = `
            INSERT INTO "users" ("name", "email", "passwordHash")
VALUES ($1, $2, $3)
RETURNING "id", "name", "email", "createdAt";

        `;
    const result = await pool.query(query, [
      userData.name,
      userData.email,
      userData.passwordHash,
    ]);
    return result.rows[0];
  }

  static async update(id: string, data: IUserUpdate): Promise<IUser | null> {
    const fields = Object.keys(data)
      // change key to passwordHash if password is updated
      .map(
        (key, index) =>
          `${key == "password" ? "passwordHash" : key} = $${index + 2}`
      )
      .join(", ");

    const query = `
            UPDATE "users"
SET ${fields}, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = $1
RETURNING "id", "name", "email", "createdAt", "updatedAt";

        `;

    const values = [id, ...Object.values(data)];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Example of finding a user by email
  static async findUserByEmail(email: string): Promise<IUser | null> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Get a user by ID
  static async getUserById(id: string): Promise<IUser | null> {
    const query = `
            SELECT "id", "name", "email", "createdAt", "updatedAt"
FROM "users"
WHERE "id" = $1;

        `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get all users
  static async getAllUsers(): Promise<IUser[]> {
    const query = `SELECT "id", "name", "email", "createdAt", "updatedAt" 
FROM "users";
`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const query = `DELETE FROM "users" WHERE "id" = $1;
`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0; // Return true if the user was deleted
  }

  static async getUserPosts(userId: string): Promise<any[]> {
    const query = `SELECT * FROM "posts" WHERE "userId" = $1;
`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getTopUsersWithLatestComments(): Promise<any[]> {
    const result = await pool.query(`
          WITH "RankedUsers" AS (
    SELECT 
        u."id",
        u."name",
        COUNT(p."id") AS "postCount",
        ROW_NUMBER() OVER (ORDER BY COUNT(p."id") DESC) AS "rn"
    FROM "users" u
    LEFT JOIN "posts" p ON u."id" = p."userId"
    GROUP BY u."id", u."name"
    LIMIT 3
),
"LatestComments" AS (
    SELECT DISTINCT ON (c."userId")
        c."userId",
        c."content" AS "latestComment",
        c."createdAt",
        p."title" AS "postTitle"
    FROM "comments" c
    JOIN "posts" p ON c."postId" = p."id"
    WHERE c."userId" IN (SELECT "id" FROM "RankedUsers")
    ORDER BY c."userId", c."createdAt" DESC
)
SELECT 
    ru."id",
    ru."name",
    ru."postCount",
    lc."latestComment",
    lc."postTitle",
    lc."createdAt" AS "commentCreatedAt"
FROM "RankedUsers" ru
LEFT JOIN "LatestComments" lc ON ru."id" = lc."userId"
ORDER BY ru."postCount" DESC;

        `);
    return result.rows;
  }
}

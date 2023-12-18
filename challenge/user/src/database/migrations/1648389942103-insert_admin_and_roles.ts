import { hashSync } from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertAdminAndRoles1648389942103 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`   
      INSERT INTO "role"
        (initials)
      VALUES
        ('ADM'),
        ('BASIC')
        ('EXCLUSIVE');
        ('PRIME');

      INSERT INTO "user"
        ("name", email, "password")
      VALUES
        ('ADMINISTRATOR', 'admin@email.com', '${hashSync('admin')}');

      INSERT INTO "user_role"
        ("user_id", "role_id")
      VALUES
        (
          (SELECT id FROM "user" WHERE email = 'admin@email.com'),
          (SELECT id FROM "role" WHERE initials = 'ADM')
        ),(
          (SELECT id FROM "user" WHERE email = 'admin@email.com'),
          (SELECT id FROM "role" WHERE initials = 'BASIC')
        )
    `);
  }
// 'ADM'|'BASIC'|'EXCLUSIVE' |'PRIME'
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "user_role" WHERE user_id = (SELECT id FROM "user" WHERE email = 'admin@email.com');
      DELETE FROM "role" WHERE id = (SELECT id FROM "role" WHERE initials = 'ADM');
      DELETE FROM "role" WHERE id = (SELECT id FROM "role" WHERE initials = 'BASIC');
      DELETE FROM "role" WHERE id = (SELECT id FROM "role" WHERE initials = 'EXCLUSIVE');
      DELETE FROM "role" WHERE id = (SELECT id FROM "role" WHERE initials = 'PRIME');
      DELETE FROM "user" WHERE id = (SELECT id FROM "user" WHERE email = 'admin@email.com');
    `);
  }
}

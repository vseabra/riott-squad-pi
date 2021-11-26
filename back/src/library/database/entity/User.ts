import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn() // Alterar para @PrimaryGeneratedColumn em caso de banco diferente do MongoDB
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column({ unique: true })
    public email: string;

    @Column()
    public passwordHash: string;

    @Column()
    public createdAt: Date;

    @Column()
    public updatedAt: Date;

    @BeforeInsert()
    public setCreateDate(): void {
        this.createdAt = new Date();
    }

    @BeforeInsert()
    @BeforeUpdate()
    public setUpdateDate(): void {
        this.updatedAt = new Date();
    }
}

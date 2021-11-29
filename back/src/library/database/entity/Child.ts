import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, BaseEntity, OneToMany, ManyToOne } from 'typeorm';
import { ChildTaskList } from './ChildTaskList';
import { Parent } from './Parent';

@Entity()
export class Child extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public value: number;

    @ManyToOne(() => Parent, parent => parent.children)
    public parent: Parent;

    @Column()
    public name: string;

    @Column()
    public allowance: number;

    @Column()
    public birthday: Date;

    @Column()
    public photo: string;

    @OneToMany(() => ChildTaskList, childTaskList => childTaskList.child)
    public childTaskList: ChildTaskList[];

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
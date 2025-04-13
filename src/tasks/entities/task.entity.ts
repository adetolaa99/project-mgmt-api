import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  title: string;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ nullable: true })
  due_date: Date;

  @CreateDateColumn()
  created_at: Date;
}

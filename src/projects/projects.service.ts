import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);
    this.projectsRepository.merge(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: number): Promise<{ message: string }> {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
    return {
      message: `Project ${id} has been successfully deleted`,
    };
  }

  async findAll(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<{ data: Project[]; total: number }> {
    const queryBuilder = this.projectsRepository.createQueryBuilder('project');

    if (search) {
      queryBuilder.where('project.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder.skip(offset).take(limit).getMany();

    return { data, total };
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found!`);
    }

    return project;
  }
}

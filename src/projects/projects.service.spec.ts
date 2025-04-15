import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let projectsRepository: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
  });

  it('should create a project successfully', async () => {
    const createProjectDto = {
      name: 'New Project',
      description: 'Description',
    };
    const savedProject: Project = {
      id: 1,
      name: 'New Project',
      description: 'Description',
      created_at: new Date(),
      tasks: [],
    };

    jest.spyOn(projectsRepository, 'save').mockResolvedValue(savedProject);

    const result = await projectsService.create(createProjectDto);
    expect(result).toEqual(savedProject);
    expect(projectsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(createProjectDto),
    );
  });

  it('should update an existing project', async () => {
    const existingProject: Project = {
      id: 1,
      name: 'Old Name',
      description: 'Old Description',
      created_at: new Date(),
      tasks: [],
    };
    const updateDto = { name: 'Updated Name' };

    jest
      .spyOn(projectsRepository, 'findOne')
      .mockResolvedValue(existingProject);
    jest
      .spyOn(projectsRepository, 'save')
      .mockResolvedValue({ ...existingProject, ...updateDto });

    const result = await projectsService.update(1, updateDto);
    expect(result).toEqual({ ...existingProject, ...updateDto });
    expect(projectsRepository.save).toHaveBeenCalled();
  });

  it('should return an error if the project is not found', async () => {
    jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(null);

    await expect(projectsService.findOne(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a project successfully', async () => {
    const existingProject: Project = {
      id: 1,
      name: 'Old Name',
      description: 'Old Description',
      created_at: new Date(),
      tasks: [],
    };

    jest
      .spyOn(projectsRepository, 'findOne')
      .mockResolvedValue(existingProject);
    jest.spyOn(projectsRepository, 'remove').mockResolvedValue(existingProject);

    const result = await projectsService.remove(1);
    expect(result).toEqual({
      message: `Project 1 has been successfully deleted`,
    });
    expect(projectsRepository.remove).toHaveBeenCalledWith(existingProject);
  });
});

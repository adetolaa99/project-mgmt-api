import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

describe('ProjectsController', () => {
  let projectsController: ProjectsController;
  let projectsService: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Test Project' }),
            update: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Updated Project' }),
            remove: jest.fn().mockResolvedValue({
              message: 'Project 1 has been successfully deleted',
            }),
            findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Test Project' }),
          },
        },
      ],
    }).compile();

    projectsController = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should create a project and return it', async () => {
    const createDto: CreateProjectDto = { name: 'Test Project' };
    const result = await projectsController.create(createDto);

    expect(result).toEqual({ id: 1, name: 'Test Project' });
    expect(projectsService.create).toHaveBeenCalledWith(createDto);
  });

  it('should update a project and return the updated data', async () => {
    const updateDto: UpdateProjectDto = { name: 'Updated Project' };
    const result = await projectsController.update(1, updateDto);

    expect(result).toEqual({ id: 1, name: 'Updated Project' });
    expect(projectsService.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should delete a project', async () => {
    const result = await projectsController.remove(1);

    expect(result).toEqual({
      message: 'Project 1 has been successfully deleted',
    });
    expect(projectsService.remove).toHaveBeenCalledWith(1);
  });

  it('should fetch all projects', async () => {
    const result = await projectsController.findAll(10, 0, '');
    expect(result).toEqual({ data: [], total: 0 });
    expect(projectsService.findAll).toHaveBeenCalledWith(10, 0, '');
  });

  it('should fetch a single project', async () => {
    const result = await projectsController.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Test Project' });
    expect(projectsService.findOne).toHaveBeenCalledWith(1);
  });
});

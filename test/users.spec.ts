import {
  test,
  beforeAll,
  afterAll,
  describe,
  expect,
  beforeEach,
  afterEach,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

function createNewUser() {
  return request(app.server).post('/users').send({
    name: 'Caio Rosa',
    email: 'Geral-caio@gmail.com',
  })
}

describe('Users routes', () => {
  // run all migrations before each test
  beforeEach(async () => {
    execSync('npm run migrationsUp')
  })

  // rollback all migrations before each test
  afterEach(async () => {
    execSync('npm run migrationsDown')
  })

  // await app starts
  beforeAll(async () => {
    await app.ready()
  })

  // shootdown app afer all tests
  afterAll(async () => {
    await app.close()
  })

  test('should be able to create a new user', async () => {
    await createNewUser().expect(201)
  })

  test('should be able to list all users', async () => {
    await createNewUser()

    const listAllUsersResponse = await request(app.server)
      .get('/users')
      .expect(200)

    expect(listAllUsersResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'Caio Rosa',
        email: 'Geral-caio@gmail.com',
      }),
    ])
  })
})

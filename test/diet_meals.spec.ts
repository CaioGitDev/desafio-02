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

async function createAndGetNewUser() {
  const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      name: 'Caio Rosa',
      email: 'Geral-caio@gmail.com',
    })
    .expect(201)

  const cookies = createUserResponse.get('Set-Cookie')

  const listAllUsersResponse = await request(app.server)
    .get('/users')
    .expect(200)

  return {
    cookies,
    user: listAllUsersResponse.body.users[0],
  }
}

async function createNewUserMeal(idUser: string) {
  await request(app.server)
    .post('/meals')
    .send({
      idUser,
      mealName: 'Breakfast',
      mealDescription: 'Healthy meal',
      mealDate: new Date(),
      isDietMeal: true,
    })
    .expect(201)

  const listAllUserMeals = await request(app.server)
    .get(`/meals/user/${idUser}`)
    .expect(200)

  return listAllUserMeals.body.meals[0]
}

describe('Diet Meals Routes', () => {
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

  test('should be able to register a meal', async () => {
    const { user } = await createAndGetNewUser()

    const meal = await createNewUserMeal(user.id)

    expect(meal).toEqual(
      expect.objectContaining({
        meal_name: 'Breakfast',
        meal_description: 'Healthy meal',
      }),
    )
  })

  test('should be able to edit a meal', async () => {
    const { user } = await createAndGetNewUser()
    const { id } = await createNewUserMeal(user.id)

    const editMealResponse = await request(app.server)
      .put(`/meals/${id}/${user.id}`)
      .send({
        mealName: 'Lunch',
        mealDescription: 'Cheat meal',
        mealDate: new Date(),
        isDietMeal: false,
        updatedAt: new Date(),
      })
      .expect(200)

    const meal = editMealResponse.body.meal
    expect(meal).toEqual([
      expect.objectContaining({
        meal_name: 'Lunch',
        meal_description: 'Cheat meal',
      }),
    ])
  })

  test('should be able to delete a meal', async () => {
    const { user } = await createAndGetNewUser()
    const { id } = await createNewUserMeal(user.id)

    await request(app.server).delete(`/meals/${id}/${user.id}`).expect(204)
  })

  test('should be able to list all meals of a user', async () => {
    const { user } = await createAndGetNewUser()
    await createNewUserMeal(user.id)

    const listAllUserMeals = await request(app.server)
      .get(`/meals/user/${user.id}`)
      .expect(200)

    expect(listAllUserMeals.body).toEqual({
      meals: [
        expect.objectContaining({
          meal_name: 'Breakfast',
          meal_description: 'Healthy meal',
        }),
      ],
    })
  })

  test('should be able to view a single meal', async () => {
    const { user, cookies } = await createAndGetNewUser()
    const { id } = await createNewUserMeal(user.id)

    const getMealByIdResponse = await request(app.server)
      .get(`/meals/${id}/${user.id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealByIdResponse.body).toEqual({
      meal: expect.objectContaining({
        meal_name: 'Breakfast',
        meal_description: 'Healthy meal',
      }),
    })
  })

  test('should be able to get user metrics', async () => {})
})

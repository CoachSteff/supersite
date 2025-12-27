export const remark = jest.fn(() => ({
  use: jest.fn().mockReturnThis(),
  process: jest.fn((markdown: string) => 
    Promise.resolve({ 
      value: `<p>${markdown}</p>`,
      toString: () => `<p>${markdown}</p>`
    })
  ),
}))

export default { remark }

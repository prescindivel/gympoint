module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'students',
      [
        {
          name: 'Cleiton Martins',
          email: 'cleiton@gympoint.com',
          age: 23,
          weight: 60,
          height: 1.8,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Thais Cardoso',
          email: 'thais@gympoint.com',
          age: 24,
          weight: 70,
          height: 1.8,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('students', null, {});
  }
};

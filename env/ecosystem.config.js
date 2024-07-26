module.exports = {
  apps: [
    {
      name: 'sssh-backend',
      script: 'src/main.js',
      instances: 1, // 프로세스 수 제한 (추후 확장을 위해 설정 가능)
      exec_mode: 'fork', // 단일 프로세스로 실행
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

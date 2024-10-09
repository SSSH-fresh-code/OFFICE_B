module.exports = {
	apps: [
		{
			name: "sssh-backend",
			script: "src/main.js",
			instances: 2, // 프로세스 수 제한 (추후 확장을 위해 설정 가능)
			exec_mode: "cluster", // 단일 프로세스로 실행
			env: {
				NODE_ENV: "production",
			},
			max_memory_restart: "500M",
			log_file: "logs/nest-app.log", // 로그 파일 경로 설정
			out_file: "logs/nest-app-out.log",
			error_file: "logs/nest-app-err.log",
		},
	],
};

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:password@localhost:3306/aiboot"
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:0.5b"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
COPY assets/ /build/assets/
RUN npm run build

FROM python:3.13-slim-bookworm@sha256:a1165e272e578941b84abc79e4ab38a0305cd12803a5c4247979ac7655f4d641
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    FRONTEND_DIST=/app/frontend/dist FASTAPI_OTEL_AUTO_CONFIGURE=false \
    HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m pip install --only-binary=:all: --require-hashes -r backend/requirements.txt \
    && useradd --uid 10001 --create-home appuser
COPY backend/ ./backend/
COPY scripts/serve.py ./scripts/serve.py
COPY ml/sparse_model.py ml/data_prep.py ./ml/
COPY ml/sources/mendeley-v1.json ./ml/sources/mendeley-v1.json
COPY build/model.json ./ml/artifacts/goal02-provisional-v2/tfidf_c2.0.json
COPY ml/reports/goal02-provisional-v2.json ./ml/reports/goal02-provisional-v2.json
COPY --from=frontend-build /build/frontend/dist ./frontend/dist/
USER 10001
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/api/health', timeout=2)"
CMD ["python", "scripts/serve.py", "--host", "0.0.0.0", "--port", "7860"]

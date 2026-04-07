SHELL := /bin/bash

.PHONY: help start stop restart logs status ps \
        start-tunnel stop-tunnel restart-tunnel tunnel-status tunnel-logs \
        web-up web-down ports

help:
	@echo "Smart Canteen command shortcuts"
	@echo ""
	@echo "App lifecycle:"
	@echo "  make start           - Build and start all Docker services"
	@echo "  make stop            - Stop and remove Docker services"
	@echo "  make restart         - Restart Docker services"
	@echo "  make logs            - Follow logs from all services"
	@echo "  make status          - Show Docker + tunnel status"
	@echo "  make ps              - Show compose containers"
	@echo ""
	@echo "Cloudflare Tunnel:"
	@echo "  make start-tunnel    - Start cloudflared user service"
	@echo "  make stop-tunnel     - Stop cloudflared user service"
	@echo "  make restart-tunnel  - Restart cloudflared user service"
	@echo "  make tunnel-status   - Show cloudflared service status"
	@echo "  make tunnel-logs     - Follow cloudflared logs"
	@echo ""
	@echo "Combined:"
	@echo "  make web-up          - Start Docker + tunnel"
	@echo "  make web-down        - Stop tunnel + Docker"
	@echo "  make ports           - Show required ports and URLs"

start:
	docker compose up -d --build
	docker compose restart nginx

stop:
	docker compose down

restart:
	docker compose down && docker compose up -d --build

logs:
	docker compose logs -f --tail=150

ps:
	docker compose ps

status:
	@echo "== Docker Services =="
	@docker compose ps
	@echo ""
	@echo "== Tunnel Service =="
	@systemctl --user --no-pager --full status cloudflared-smartcanteen.service || true

start-tunnel:
	systemctl --user daemon-reload
	systemctl --user enable --now cloudflared-smartcanteen.service
	systemctl --user --no-pager status cloudflared-smartcanteen.service

stop-tunnel:
	systemctl --user stop cloudflared-smartcanteen.service
	systemctl --user --no-pager status cloudflared-smartcanteen.service || true

restart-tunnel:
	systemctl --user daemon-reload
	systemctl --user restart cloudflared-smartcanteen.service
	systemctl --user --no-pager status cloudflared-smartcanteen.service

tunnel-status:
	systemctl --user --no-pager status cloudflared-smartcanteen.service

tunnel-logs:
	journalctl --user -u cloudflared-smartcanteen.service -f

web-up:
	docker compose up -d --build
	docker compose restart nginx
	systemctl --user daemon-reload
	systemctl --user enable --now cloudflared-smartcanteen.service
	@echo "Web stack started. Run 'make ports' for endpoint list."

web-down:
	systemctl --user stop cloudflared-smartcanteen.service || true
	docker compose down

ports:
	@echo "Required/used ports on this machine:"
	@echo "  8080/tcp - Nginx HTTP entrypoint (local host)"
	@echo "  8443/tcp - Nginx HTTPS entrypoint (local host, optional)"
	@echo "  8000/tcp - API (published for direct/debug access)"
	@echo "  8001/tcp - CV MJPEG feed (published for direct/debug access)"
	@echo ""
	@echo "Main URLs:"
	@echo "  https://smart-canteen.app"
	@echo "  https://www.smart-canteen.app"
	@echo ""
	@echo "Health checks:"
	@echo "  curl -I https://smart-canteen.app"
	@echo "  curl -I https://smart-canteen.app/api/health"
	@echo "  cloudflared tunnel info 3be34f50-a4c3-4226-ad5f-74b112c1c627"

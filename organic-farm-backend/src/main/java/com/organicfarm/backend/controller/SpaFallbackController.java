package com.organicfarm.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA Fallback Controller — forwards React Router paths to index.html.
 *
 * IMPORTANT: Only list EXPLICIT frontend routes here.
 * Do NOT use catch-all wildcards like "/{path}/**" — they intercept
 * /assets/*.js and /assets/*.css causing MIME type errors.
 *
 * Spring Boot automatically serves /assets/** from src/main/resources/static/
 * so we don't need to handle those here.
 */
@Controller
public class SpaFallbackController {

    @RequestMapping(value = {
            "/home",
            "/products",
            "/cart",
            "/login",
            "/farmers",
            "/ai-tools",
            "/about",
            "/contact"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}

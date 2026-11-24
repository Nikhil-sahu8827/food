package com.restaurant.controller;

import com.restaurant.dto.CategoryDto;
import com.restaurant.dto.FoodItemDto;
import com.restaurant.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<List<FoodItemDto>> getAvailableMenu(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        List<FoodItemDto> items = menuService.getFoodItems(true, categoryId, search);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        List<CategoryDto> categories = menuService.getCategories(true);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDto> getFoodItemById(@PathVariable Long id) {
        FoodItemDto item = menuService.getFoodItemById(id);
        return ResponseEntity.ok(item);
    }
}

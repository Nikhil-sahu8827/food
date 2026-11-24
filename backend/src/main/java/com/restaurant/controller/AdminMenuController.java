package com.restaurant.controller;

import com.restaurant.dto.CategoryDto;
import com.restaurant.dto.FoodCategoryRequest;
import com.restaurant.dto.FoodItemDto;
import com.restaurant.dto.FoodItemRequest;
import com.restaurant.service.MenuService;
import com.restaurant.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final MenuService menuService;
    private final StorageService storageService;

    public AdminMenuController(MenuService menuService, StorageService storageService) {
        this.menuService = menuService;
        this.storageService = storageService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<FoodItemDto>> getAllMenuItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        List<FoodItemDto> items = menuService.getFoodItems(false, categoryId, search);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<FoodItemDto> createFoodItem(@Valid @RequestBody FoodItemRequest request) {
        FoodItemDto created = menuService.createFoodItem(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItemDto> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemDto updated = menuService.updateFoodItem(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFoodItem(@PathVariable Long id) {
        menuService.deleteFoodItem(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Food item deleted successfully"));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<FoodItemDto> toggleAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean available) {
        FoodItemDto updated = menuService.toggleAvailability(id, available);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadFoodImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.storeFile(file);
        return ResponseEntity.ok(Collections.singletonMap("imageUrl", fileUrl));
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = menuService.getCategories(false);
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody FoodCategoryRequest request) {
        CategoryDto created = menuService.createCategory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody FoodCategoryRequest request) {
        CategoryDto updated = menuService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Category deleted successfully"));
    }
}

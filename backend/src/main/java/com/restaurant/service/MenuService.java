package com.restaurant.service;

import com.restaurant.dto.CategoryDto;
import com.restaurant.dto.FoodCategoryRequest;
import com.restaurant.dto.FoodItemDto;
import com.restaurant.dto.FoodItemRequest;
import com.restaurant.entity.FoodCategory;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodCategoryRepository;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final FoodCategoryRepository categoryRepository;
    private final FoodItemRepository itemRepository;

    public MenuService(FoodCategoryRepository categoryRepository, FoodItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories(boolean onlyActive) {
        List<FoodCategory> categories = onlyActive
                ? categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                : categoryRepository.findAllByOrderByDisplayOrderAsc();

        return categories.stream()
                .map(cat -> new CategoryDto(cat, cat.getFoodItems() != null ? cat.getFoodItems().size() : 0))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodItemDto> getFoodItems(boolean availableOnly, Long categoryId, String search) {
        if (StringUtils.hasText(search)) {
            return itemRepository.searchByNameOrDescription(search.trim()).stream()
                    .filter(item -> !availableOnly || (item.getAvailable() && item.getCategory().getActive()))
                    .map(FoodItemDto::new)
                    .collect(Collectors.toList());
        }

        if (categoryId != null) {
            if (availableOnly) {
                return itemRepository.findByCategoryIdAndAvailableTrue(categoryId).stream()
                        .map(FoodItemDto::new)
                        .collect(Collectors.toList());
            } else {
                return itemRepository.findAllWithCategory().stream()
                        .filter(item -> item.getCategory().getId().equals(categoryId))
                        .map(FoodItemDto::new)
                        .collect(Collectors.toList());
            }
        }

        if (availableOnly) {
            return itemRepository.findAllAvailableWithCategory().stream()
                    .map(FoodItemDto::new)
                    .collect(Collectors.toList());
        } else {
            return itemRepository.findAllWithCategory().stream()
                    .map(FoodItemDto::new)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public FoodItemDto getFoodItemById(Long id) {
        FoodItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        return new FoodItemDto(item);
    }

    @Transactional
    public CategoryDto createCategory(FoodCategoryRequest request) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(request.getCategoryName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }
        FoodCategory category = new FoodCategory(
                request.getCategoryName().trim(),
                request.getDescription(),
                request.getActive(),
                request.getDisplayOrder()
        );
        FoodCategory saved = categoryRepository.save(category);
        return new CategoryDto(saved, 0);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, FoodCategoryRequest request) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!category.getCategoryName().equalsIgnoreCase(request.getCategoryName().trim())
                && categoryRepository.existsByCategoryNameIgnoreCase(request.getCategoryName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }

        category.setCategoryName(request.getCategoryName().trim());
        category.setDescription(request.getDescription());
        if (request.getActive() != null) category.setActive(request.getActive());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());

        FoodCategory saved = categoryRepository.save(category);
        return new CategoryDto(saved, saved.getFoodItems() != null ? saved.getFoodItems().size() : 0);
    }

    @Transactional
    public void deleteCategory(Long id) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        if (category.getFoodItems() != null && !category.getFoodItems().isEmpty()) {
            throw new BadRequestException("Cannot delete category containing existing food items. Remove or reassign food items first.");
        }
        categoryRepository.delete(category);
    }

    @Transactional
    public FoodItemDto createFoodItem(FoodItemRequest request) {
        FoodCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        FoodItem item = new FoodItem(
                request.getName().trim(),
                request.getDescription(),
                request.getPrice(),
                request.getImageUrl(),
                category,
                request.getVeg(),
                request.getAvailable()
        );

        FoodItem saved = itemRepository.save(item);
        return new FoodItemDto(saved);
    }

    @Transactional
    public FoodItemDto updateFoodItem(Long id, FoodItemRequest request) {
        FoodItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        if (!item.getCategory().getId().equals(request.getCategoryId())) {
            FoodCategory newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            item.setCategory(newCategory);
        }

        item.setName(request.getName().trim());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        if (request.getVeg() != null) item.setVeg(request.getVeg());
        if (request.getAvailable() != null) item.setAvailable(request.getAvailable());

        FoodItem saved = itemRepository.save(item);
        return new FoodItemDto(saved);
    }

    @Transactional
    public void deleteFoodItem(Long id) {
        FoodItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        itemRepository.delete(item);
    }

    @Transactional
    public FoodItemDto toggleAvailability(Long id, Boolean available) {
        FoodItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        if (available != null) {
            item.setAvailable(available);
        } else {
            item.setAvailable(!item.getAvailable());
        }

        FoodItem saved = itemRepository.save(item);
        return new FoodItemDto(saved);
    }
}

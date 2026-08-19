#include "clicker/CounterRenderer.h"
#include "clicker/ClickerConfig.h"
#include "Display.h"
#include "fonts/ThemeFonts.h"

extern Adafruit_SSD1306 display;

void CounterRenderer::formatCount(uint64_t count, char* buffer, size_t bufferSize) const {
    if (bufferSize == 0) {
        return;
    }

    if (count >= 1000000ULL) {
        uint64_t whole = count / 1000000ULL;
        uint64_t frac = (count / 100000ULL) % 10ULL;
        if (frac > 0) {
            snprintf(buffer, bufferSize, "%llu.%lluM",
                     (unsigned long long)whole, (unsigned long long)frac);
        } else {
            snprintf(buffer, bufferSize, "%lluM", (unsigned long long)whole);
        }
    } else if (count >= 10000ULL) {
        uint64_t whole = count / 1000ULL;
        uint64_t frac = (count / 100ULL) % 10ULL;
        if (frac > 0) {
            snprintf(buffer, bufferSize, "%llu.%lluK",
                     (unsigned long long)whole, (unsigned long long)frac);
        } else {
            snprintf(buffer, bufferSize, "%lluK", (unsigned long long)whole);
        }
    } else {
        snprintf(buffer, bufferSize, "%llu", (unsigned long long)count);
    }
}

bool CounterRenderer::shouldShowRemaining(uint64_t lifetimeClicks, uint32_t cycleClicks) const {
    (void)lifetimeClicks;
    return cycleClicks >= 99000 && cycleClicks < 100000;
}

uint64_t CounterRenderer::getRemainingInCycle(uint64_t lifetimeClicks) const {
    return CLICKER_CYCLE_LENGTH - (lifetimeClicks % CLICKER_CYCLE_LENGTH);
}

void CounterRenderer::drawCountCentered(uint64_t count) const {
    char buffer[24];
    formatCount(count, buffer, sizeof(buffer));
    ThemeFonts::drawCenteredBestFit(&Rajdhani40pt7b, &Rajdhani32pt7b, buffer, 32, 124);
}

void CounterRenderer::drawRemaining(uint64_t remaining, uint32_t nowMs) {
    (void)nowMs;
    display.clearDisplay();
    drawCountCentered(remaining);
    display.display();
}

void CounterRenderer::drawNormal(uint64_t lifetimeClicks, uint32_t cycleClicks, uint32_t cycleNumber, uint32_t nowMs) {
    (void)cycleNumber;

    if (shouldShowRemaining(lifetimeClicks, cycleClicks)) {
        drawRemaining(getRemainingInCycle(lifetimeClicks), nowMs);
        return;
    }

    (void)nowMs;
    display.clearDisplay();
    drawCountCentered(lifetimeClicks);
    display.display();
}

#ifndef COUNTER_RENDERER_H
#define COUNTER_RENDERER_H

#include <Arduino.h>
#include <stdint.h>

class CounterRenderer {
private:
    void formatCount(uint64_t count, char* buffer, size_t bufferSize) const;
    void drawCountCentered(uint64_t count) const;

public:
    void onClick(uint32_t nowMs);
    void update(uint32_t nowMs);

    bool shouldShowRemaining(uint64_t lifetimeClicks, uint32_t cycleClicks) const;
    uint64_t getRemainingInCycle(uint64_t lifetimeClicks) const;

    void drawNormal(uint64_t lifetimeClicks, uint32_t cycleClicks, uint32_t cycleNumber, uint32_t nowMs);
    void drawRemaining(uint64_t remaining, uint32_t nowMs);
};

#endif // COUNTER_RENDERER_H

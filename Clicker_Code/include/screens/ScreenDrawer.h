#ifndef SCREEN_DRAWER_H
#define SCREEN_DRAWER_H

#include <stdint.h>
#include "screens/OledScreen.h"

class ScreenDrawer {
public:
    static void drawFullScreen(const uint8_t* data, uint8_t width, uint8_t height, int16_t x = 0, int16_t y = 0);
    static void drawCelebration(const CelebrationScreen* screen, uint64_t count, uint32_t nowMs, uint8_t animPhase = 0);
};

#endif // SCREEN_DRAWER_H

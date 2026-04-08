import { View, Text, Pressable, Modal } from "react-native";
import { useState } from "react";

interface CalendarPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarPickerBottomSheet({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
}: CalendarPickerBottomSheetProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    selectedDate ? selectedDate.getDate() : null,
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handlePreviousYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()),
    );
  };

  const handleNextYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()),
    );
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        selectedDay,
      );
      onSelectDate(date);
      onClose();
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="bg-light-bgSecondary dark:bg-background-secondary rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="px-6 py-4">
            <View className="w-12 h-1 bg-light-border dark:bg-ui-border rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between mb-6">
              <Pressable
                className="w-10 h-10 items-center justify-center active:opacity-60"
                onPress={handlePreviousYear}
              >
                <Text className="text-xl font-bold text-light-text dark:text-text-primary">
                  ‹‹
                </Text>
              </Pressable>
              <Pressable
                className="w-10 h-10 items-center justify-center active:opacity-60"
                onPress={handlePreviousMonth}
              >
                <Text className="text-xl text-light-text dark:text-text-primary">
                  ‹
                </Text>
              </Pressable>
              <Text className="text-xl md:text-2xl font-bold text-light-text dark:text-text-primary">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </Text>
              <Pressable
                className="w-10 h-10 items-center justify-center active:opacity-60"
                onPress={handleNextMonth}
              >
                <Text className="text-xl text-light-text dark:text-text-primary">
                  ›
                </Text>
              </Pressable>
              <Pressable
                className="w-10 h-10 items-center justify-center active:opacity-60"
                onPress={handleNextYear}
              >
                <Text className="text-xl font-bold text-light-text dark:text-text-primary">
                  ››
                </Text>
              </Pressable>
            </View>

            <View className="flex-row mb-3">
              {daysOfWeek.map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs font-semibold text-light-textSecondary dark:text-text-secondary">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap mb-6">
              {days.map((day, index) => (
                <View key={index} className="w-[14.28%] aspect-square p-1">
                  {day ? (
                    <Pressable
                      className={`flex-1 items-center justify-center rounded-full ${
                        selectedDay === day
                          ? "bg-primary-main"
                          : "active:bg-light-bgTertiary dark:active:bg-background-tertiary"
                      }`}
                      onPress={() => handleDayPress(day)}
                    >
                      <Text
                        className={`text-base font-medium ${
                          selectedDay === day
                            ? "text-light-text dark:text-text-primary"
                            : "text-light-text dark:text-text-primary"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="flex-1" />
                  )}
                </View>
              ))}
            </View>

            <Pressable
              className={`rounded-xl py-4 items-center mb-4 ${
                selectedDay
                  ? "bg-primary-main active:bg-primary-dark"
                  : "bg-light-border dark:bg-ui-border"
              }`}
              disabled={!selectedDay}
              onPress={handleConfirm}
            >
              <Text
                className={`text-base font-bold ${
                  selectedDay
                    ? "text-light-text dark:text-text-primary"
                    : "text-light-textSecondary dark:text-text-secondary"
                }`}
              >
                Select Date
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

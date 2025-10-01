<template>
  <div>
    <h2 class="text-center mb-5 font-bold text-xl text-white">
      BEST OF THE WEEK
    </h2>
    <div class="container podium">
      <div class="podium__item">
        <div
          class="podium__user mx-auto h-12 w-12 3xl:h-16 3xl:w-16 rounded-full border-4"
          style="border-color: #585859"
        ></div>

        <div class="text-center my-3 text-white font-bold text-md 3xl:text-lg">
          Gennaro
        </div>

        <div class="podium__rank second bg-primary rounded-tl-xl">2</div>
      </div>
      <div class="podium__item">
        <div
          class="podium__user mx-auto h-12 w-12 3xl:h-16 3xl:w-16 rounded-full border-4"
          style="border-color: #c2b55b"
        ></div>
        <div
          class="font-bold text-center text-lg 3xl:text-2xl my-2 3xl:my-3 text-white"
        >
          Vincenzo
        </div>
        <div class="podium__rank first bg-primary rounded-t-xl">1</div>
      </div>
      <div class="podium__item">
        <div
          class="podium__user mx-auto mb-3 h-12 w-12 3xl:h-16 3xl:w-16 rounded-full border-4"
          style="border-color: #c2735b"
        ></div>
        <div class="font-bold text-center my-3 text-white text-sm 3xl:text-md">
          Flavio
        </div>
        <div class="podium__rank third bg-primary rounded-tr-xl">3</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Podium",
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: flex-end;
}

.podium__item {
  width: 200px;
}
.podium__rank {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 35px;
  color: #fff;
}

.podium__user {
  text-align: center;
  padding: 0 0.5rem;
}

.podium__number {
  width: 27px;
  height: 75px;
}

.podium .first {
  min-height: 130px;
  max-height: 130px;
}

.podium .second {
  min-height: 80px;
  max-height: 80px;
}

.podium .third {
  min-height: 50px;
  max-height: 50px;
}

@media screen and (width < 2053px) {
  .podium__item {
    width: 100px;
  }

  .podium .first {
    min-height: 80px;
    max-height: 80px;
  }

  .podium .second {
    min-height: 50px;
    max-height: 50px;
  }

  .podium .third {
    min-height: 40px;
    max-height: 40px;
  }

  .podium__rank {
    font-size: 30px;
  }
}
</style>

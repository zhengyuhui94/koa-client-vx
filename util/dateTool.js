const dateTool = {
   // 格式化时间为 xxxx-xx-xx xx-xx-xx
   formatLineDate(date, showDay, showSecond){
       const year = date.getFullYear();
       let month = date.getMonth() + 1;
       if(month < 10){
           month = `0${month}`;
       }
       let newDate;
       if(showDay){
           let day = date.getDate();
           if(day < 10){
               day = `0${day}`;
           }
           newDate = `${year}-${month}-${day}`;
           if(showSecond){
               let hour = date.getHours();
               if(hour < 10){
                   hour = `0${hour}`;
               }
               let minute = date.getMinutes();
               if(minute < 10){
                   minute = `0${minute}`;
               }
               let second = date.getSeconds();
               if(second < 10){
                   second = `0${second}`;
               }
               newDate = `${newDate}  ${hour}:${minute}:${second}`;
           }
       }else{
           newDate = `${year}-${month}`;
       }
       return newDate;
   },
   // 格式化时间为 xxxx年xx月xx日 星期x
   formatDate(date, showDay, showWeek){
	   const weeks = ['日', '一', '二', '三', '四', '五', '六'];
	   const year = date.getFullYear();
	   let month = date.getMonth() + 1;
	   if(month < 10){
		   month = `0${month}`;
	   }
	   let newDate = `${year}年${month}月`;
	   if(showDay){
		   let day = date.getDate();
		   if(day < 10){
			   day = `0${day}`;
		   }
		   newDate = `${newDate}${day}日`;
	   }
	   if(showWeek){
		   const week = weeks[date.getDay()];
		   newDate = `${newDate} 星期${week}`;
	   }
	   return newDate;
   }
};

export default dateTool;


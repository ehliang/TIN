package mhacks.com.tin;

import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {
    private double latitude, longitude;
    private static MainActivity inst;

    public static MainActivity instance()
    {
        return inst;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        TelephonyManager tMgr = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);

        final String mPhoneNumber = tMgr.getLine1Number();

        final Button sendLocation = (Button) findViewById(R.id.send_location);

        final LocationListener locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null)
                {
                    locationManager.removeUpdates(this);
                    SmsManager smsManager = SmsManager.getDefault();

                    latitude = location.getLatitude();
                    longitude = location.getLongitude();

                    sendLocation.setText("Location Found\nWaiting for Match");

                    Log.i(mPhoneNumber, "phone number");
                    String messageContent = "@" + mPhoneNumber + "@" + latitude + "@" + longitude;

                    Log.i("messageContent", messageContent);
                    smsManager.sendTextMessage("17082924124", null, messageContent, null, null);
                    Toast.makeText(getBaseContext(), "SMS Sent", Toast.LENGTH_SHORT).show();

                }

                TextView test = (TextView) findViewById(R.id.test_text);
                test.setText("Your Location is:\n" + "Latitude: " + latitude + "\nand\n Longitude: " + longitude);

                Log.i("" + latitude, "" + longitude);

            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {

                Log.i("onstatus", "changed");
            }

            @Override
            public void onProviderEnabled(String provider) {
                Log.i("provider", "enabled");
            }

            @Override
            public void onProviderDisabled(String provider) {

                Log.i("provider", "disabled");
            }
        };


        sendLocation.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i("pressed", "button");
                sendLocation.setText("Retrieving Location...");
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);

            }
        });


    }

    public static void retreiveMessage(String messageString)
    {
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}

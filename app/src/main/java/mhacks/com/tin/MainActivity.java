package mhacks.com.tin;

import android.app.ActionBar;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.PorterDuff;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.renderscript.Sampler;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.util.jar.Manifest;

public class MainActivity extends AppCompatActivity implements SmsBroadcastReceiver.OnSmsReceivedListener {
    private double latitude, longitude;
    private SmsBroadcastReceiver receiver = new SmsBroadcastReceiver();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ActivityCompat.requestPermissions(this, new String[]{"android.permission.READ_SMS"}, 0);
        ActivityCompat.requestPermissions(this, new String[]{"android.permission.READ_PHONE_STATE"}, 0);
        ActivityCompat.requestPermissions(this, new String[]{"android.permission.ACCESS_FINE_LOCATION"}, 0);
        ActivityCompat.requestPermissions(this, new String[]{"android.permission.RECEIVE_SMS"}, 0);
        ActivityCompat.requestPermissions(this, new String[]{"android.permission.READ_SMS"}, 0);

        receiver.setOnSmsReceivedListener(this);

        final Button sendLocation = (Button) findViewById(R.id.send_location);
        sendLocation.getBackground().setColorFilter(0xFFFFFFFF, PorterDuff.Mode.MULTIPLY);

        final LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        TelephonyManager tMgr = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);

        final String mPhoneNumber = tMgr.getLine1Number();


        final LocationListener locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null)
                {
                    locationManager.removeUpdates(this);
                    SmsManager smsManager = SmsManager.getDefault();

                    latitude = location.getLatitude();
                    longitude = location.getLongitude();

                    sendLocation.setText("Location Found\nWaiting for Match...");

                    Log.i(mPhoneNumber, "phone number");
                    String messageContent = "@" + mPhoneNumber + "@" + latitude + "@" + longitude;

                    Log.i("messageContent", messageContent);
                    smsManager.sendTextMessage("17082924124", null, messageContent, null, null);
                    //Toast.makeText(getBaseContext(), "SMS Sent", Toast.LENGTH_SHORT).show();

                }

                TextView test = (TextView) findViewById(R.id.test_text);
                test.setText("Your Location is:\n" + "Latitude: " + latitude + "\nLongitude: " + longitude);

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
                sendLocation.setText("Waiting for location...");
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        IntentFilter intentFilter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
        this.registerReceiver(receiver, intentFilter);
        Button sendLocation = (Button) findViewById(R.id.send_location);
        sendLocation.setText("Match Now");
    }

    @Override
    protected void onPause(){
        super.onPause();
        this.unregisterReceiver(receiver);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public void onSmsReceived(String sender, String message) {
        Button sendLocation = (Button) findViewById(R.id.send_location);
        TextView test = (TextView) findViewById(R.id.test_text);
        if (message.equals(getString(R.string.found)))
        {
            sendLocation.setText(getString(R.string.found));
            Intent intent = new Intent(getBaseContext(), DirectionsActivity.class);
            startActivity(intent);
        }
        else if (message.equals(getString(R.string.not_found)))
        {
            sendLocation.setText("Match Now");
            test.setText("");
        }
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




